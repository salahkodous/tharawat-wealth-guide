-- Add monthly investing amount to personal finances table
ALTER TABLE public.personal_finances 
ADD COLUMN monthly_investing_amount NUMERIC DEFAULT 0;