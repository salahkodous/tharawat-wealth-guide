-- Create deposits and transaction logs with accurate NUMERIC math and secure RLS

-- 1) Deposits table
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deposit_type TEXT NOT NULL CHECK (deposit_type IN ('fixed_cd','savings','investment_linked')),
  principal NUMERIC(18,6) NOT NULL DEFAULT 0,
  rate NUMERIC(10,8) NOT NULL DEFAULT 0, -- APR as percentage (e.g., 5.5 for 5.5%)
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  maturity_date DATE NULL,
  last_interest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accrued_interest NUMERIC(18,6) NOT NULL DEFAULT 0,
  linked_asset UUID NULL REFERENCES public.assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | matured | closed
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Deposit transactions table (log)
CREATE TABLE IF NOT EXISTS public.deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deposit_id UUID NOT NULL REFERENCES public.deposits(id) ON DELETE CASCADE,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('creation','accrual','credit','maturity','adjustment')),
  amount NUMERIC(18,6) NOT NULL,
  description TEXT NULL,
  tx_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_user ON public.deposit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_deposit ON public.deposit_transactions(deposit_id);

-- 4) RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own deposits" ON public.deposits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own deposit tx" ON public.deposit_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) Updated_at trigger function (re-use if already exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6) Attach triggers
DROP TRIGGER IF EXISTS trg_deposits_updated_at ON public.deposits;
CREATE TRIGGER trg_deposits_updated_at
BEFORE UPDATE ON public.deposits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Default last_interest_date to start_date on insert via trigger
CREATE OR REPLACE FUNCTION public.set_last_interest_date_default()
RETURNS trigger AS $$
BEGIN
  IF NEW.last_interest_date IS NULL THEN
    NEW.last_interest_date = COALESCE(NEW.start_date, CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_deposits_set_last_interest ON public.deposits;
CREATE TRIGGER trg_deposits_set_last_interest
BEFORE INSERT ON public.deposits
FOR EACH ROW EXECUTE FUNCTION public.set_last_interest_date_default();

-- 8) Core calculation helper: calculate accrual between dates
CREATE OR REPLACE FUNCTION public.calculate_deposit_accrual(p_deposit_id uuid, p_from date, p_to date)
RETURNS NUMERIC AS $$
DECLARE
  d public.deposits;
  days INTEGER;
  accrual NUMERIC(18,8) := 0;
  daily_rate NUMERIC(18,12);
  asset_purchase NUMERIC(18,8);
  asset_current NUMERIC(18,8);
  total_days_since_start INTEGER;
  daily_growth NUMERIC(18,12);
  base NUMERIC(18,8);
BEGIN
  IF p_to <= p_from THEN
    RETURN 0;
  END IF;

  SELECT * INTO d FROM public.deposits WHERE id = p_deposit_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit % not found', p_deposit_id;
  END IF;

  days := (p_to - p_from);
  base := d.principal + d.accrued_interest;

  IF d.deposit_type = 'fixed_cd' THEN
    daily_rate := (d.rate / 100.0) / 365.0;
    accrual := base * daily_rate * days; -- simple interest accrual
  ELSIF d.deposit_type = 'savings' THEN
    daily_rate := (d.rate / 100.0) / 365.0;
    accrual := base * (power(1 + daily_rate, days) - 1); -- compound daily
  ELSE -- investment_linked
    IF d.linked_asset IS NOT NULL THEN
      SELECT COALESCE(a.purchase_price,0), COALESCE(a.current_price,0)
      INTO asset_purchase, asset_current
      FROM public.assets a WHERE a.id = d.linked_asset;
      IF asset_purchase > 0 AND asset_current > 0 THEN
        total_days_since_start := GREATEST((CURRENT_DATE - d.start_date), 1);
        daily_growth := (asset_current / asset_purchase - 1) / total_days_since_start;
        accrual := base * daily_growth * days;
      ELSE
        -- fallback to provided rate if prices missing
        daily_rate := (d.rate / 100.0) / 365.0;
        accrual := base * (power(1 + daily_rate, days) - 1);
      END IF;
    ELSE
      -- fallback to rate-based compounding
      daily_rate := (d.rate / 100.0) / 365.0;
      accrual := base * (power(1 + daily_rate, days) - 1);
    END IF;
  END IF;

  RETURN COALESCE(accrual, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9) Process a single deposit: accrue up to today and credit if needed
CREATE OR REPLACE FUNCTION public.process_deposit(p_deposit_id uuid)
RETURNS TABLE (
  deposit_id uuid,
  accrued_amount numeric,
  credited boolean,
  credited_amount numeric,
  status text
) AS $$
DECLARE
  d public.deposits;
  today date := CURRENT_DATE;
  accrue_from date;
  accrue_to date := today;
  to_add NUMERIC(18,8) := 0;
  did_credit boolean := false;
  credit_amt NUMERIC(18,8) := 0;
BEGIN
  SELECT * INTO d FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit % not found', p_deposit_id;
  END IF;

  accrue_from := d.last_interest_date;
  IF accrue_to > accrue_from THEN
    to_add := public.calculate_deposit_accrual(d.id, accrue_from, accrue_to);
    IF to_add <> 0 THEN
      UPDATE public.deposits
      SET accrued_interest = accrued_interest + to_add,
          last_interest_date = accrue_to
      WHERE id = d.id;

      INSERT INTO public.deposit_transactions (user_id, deposit_id, tx_type, amount, description)
      VALUES (d.user_id, d.id, 'accrual', to_add, 'Daily accrual through ' || accrue_to::text);
    END IF;
  END IF;

  -- Refresh record after accrual
  SELECT * INTO d FROM public.deposits WHERE id = p_deposit_id;

  -- Credit rules
  IF d.deposit_type = 'fixed_cd' THEN
    IF d.maturity_date IS NOT NULL AND today >= d.maturity_date AND d.status <> 'matured' THEN
      credit_amt := d.accrued_interest;
      UPDATE public.deposits
      SET principal = principal + credit_amt,
          accrued_interest = 0,
          status = 'matured'
      WHERE id = d.id;

      INSERT INTO public.deposit_transactions (user_id, deposit_id, tx_type, amount, description)
      VALUES (d.user_id, d.id, 'maturity', credit_amt, 'Interest credited at maturity');

      did_credit := true;
    END IF;
  ELSE
    -- credit monthly: if month boundary has passed since last_interest_date prior to accrual
    IF date_trunc('month', d.last_interest_date)::date < date_trunc('month', today)::date AND d.accrued_interest > 0 THEN
      credit_amt := d.accrued_interest;
      UPDATE public.deposits
      SET principal = principal + credit_amt,
          accrued_interest = 0
      WHERE id = d.id;

      INSERT INTO public.deposit_transactions (user_id, deposit_id, tx_type, amount, description)
      VALUES (d.user_id, d.id, 'credit', credit_amt, 'Monthly interest credit');

      did_credit := true;
    END IF;
  END IF;

  RETURN QUERY SELECT d.id, to_add, did_credit, credit_amt, d.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 10) View helper: return deposit with computed current value and monthly saving value
CREATE OR REPLACE FUNCTION public.get_deposit_view(p_deposit_id uuid)
RETURNS JSONB AS $$
DECLARE
  d public.deposits;
  pending_accrual NUMERIC(18,8) := 0;
  total_value NUMERIC(18,8) := 0;
  month_start DATE := date_trunc('month', CURRENT_DATE)::date;
  next_month DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month')::date;
  days_in_month INTEGER := (next_month - month_start);
  est_monthly_credit NUMERIC(18,8) := 0;
BEGIN
  SELECT * INTO d FROM public.deposits WHERE id = p_deposit_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit % not found', p_deposit_id;
  END IF;

  -- Pending accrual from last_interest_date to today (not yet saved)
  pending_accrual := public.calculate_deposit_accrual(d.id, d.last_interest_date, CURRENT_DATE);
  total_value := d.principal + d.accrued_interest + pending_accrual;

  -- Estimated monthly saving/credit depending on type
  IF d.deposit_type = 'fixed_cd' THEN
    -- CD credits at maturity; monthly estimate equals the month's accrual
    est_monthly_credit := public.calculate_deposit_accrual(d.id, month_start, next_month);
  ELSE
    -- For savings and investment-linked, this is the expected monthly credit
    est_monthly_credit := public.calculate_deposit_accrual(d.id, month_start, next_month);
  END IF;

  RETURN jsonb_build_object(
    'id', d.id,
    'user_id', d.user_id,
    'deposit_type', d.deposit_type,
    'principal', d.principal,
    'rate', d.rate,
    'start_date', d.start_date,
    'maturity_date', d.maturity_date,
    'last_interest_date', d.last_interest_date,
    'accrued_interest', d.accrued_interest,
    'linked_asset', d.linked_asset,
    'status', d.status,
    'computed', jsonb_build_object(
      'pending_accrual', pending_accrual,
      'total_value', total_value,
      'monthly_saving_value', est_monthly_credit
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
