-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.calculate_monthly_income(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_income NUMERIC := 0;
BEGIN
  -- Get stable income (salary + stable monthly income)
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM public.income_streams
  WHERE user_id = user_uuid 
    AND income_type IN ('salary', 'stable')
    AND is_active = true;
  
  -- Add unstable income from current month
  total_income := total_income + COALESCE((
    SELECT SUM(amount)
    FROM public.income_streams
    WHERE user_id = user_uuid 
      AND income_type = 'unstable'
      AND is_active = true
      AND EXTRACT(YEAR FROM received_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM received_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  ), 0);
  
  RETURN total_income;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';