-- Allow 'cash_savings' in deposits.deposit_type check constraint
ALTER TABLE public.deposits
DROP CONSTRAINT IF EXISTS deposits_deposit_type_check;

ALTER TABLE public.deposits
ADD CONSTRAINT deposits_deposit_type_check
CHECK (deposit_type IN ('fixed_cd', 'savings', 'investment_linked', 'cash_savings'));
