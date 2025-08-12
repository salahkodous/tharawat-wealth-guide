-- Create income_streams table
CREATE TABLE public.income_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  income_type TEXT NOT NULL CHECK (income_type IN ('salary', 'stable', 'unstable')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  received_date DATE NULL -- For unstable income tracking
);

-- Enable RLS
ALTER TABLE public.income_streams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own income streams" 
ON public.income_streams 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_income_streams_updated_at
BEFORE UPDATE ON public.income_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate monthly income from streams
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
$$ LANGUAGE plpgsql SECURITY DEFINER;