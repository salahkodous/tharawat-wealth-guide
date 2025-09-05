-- Enable realtime for all financial tables to ensure AI agent changes are immediately reflected
ALTER TABLE public.personal_finances REPLICA IDENTITY FULL;
ALTER TABLE public.income_streams REPLICA IDENTITY FULL;
ALTER TABLE public.expense_streams REPLICA IDENTITY FULL;
ALTER TABLE public.debts REPLICA IDENTITY FULL;
ALTER TABLE public.assets REPLICA IDENTITY FULL;
ALTER TABLE public.portfolios REPLICA IDENTITY FULL;
ALTER TABLE public.financial_goals REPLICA IDENTITY FULL;
ALTER TABLE public.deposits REPLICA IDENTITY FULL;
ALTER TABLE public.deposit_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_finances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.income_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_transactions;