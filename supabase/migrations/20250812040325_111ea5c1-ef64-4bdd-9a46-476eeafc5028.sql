-- Create a table for expense streams
CREATE TABLE public.expense_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fixed', 'variable', 'one_time')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expense_date DATE, -- For one-time expenses
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expense_streams ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own expense streams" 
ON public.expense_streams 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expense_streams_updated_at
BEFORE UPDATE ON public.expense_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate monthly expenses
CREATE OR REPLACE FUNCTION public.calculate_monthly_expenses(user_uuid uuid)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_expenses NUMERIC := 0;
BEGIN
  -- Get fixed and variable expenses (recurring)
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.expense_streams
  WHERE user_id = user_uuid 
    AND expense_type IN ('fixed', 'variable')
    AND is_active = true;
  
  -- Add one-time expenses from current month
  total_expenses := total_expenses + COALESCE((
    SELECT SUM(amount)
    FROM public.expense_streams
    WHERE user_id = user_uuid 
      AND expense_type = 'one_time'
      AND is_active = true
      AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  ), 0);
  
  RETURN total_expenses;
END;
$$;