-- Add monthly_saving_amount column to financial_goals table
ALTER TABLE public.financial_goals 
ADD COLUMN monthly_saving_amount numeric DEFAULT 0;