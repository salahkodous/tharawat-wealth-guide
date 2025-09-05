-- Fix the remaining RLS policy issue for kv_store table
-- This appears to be a system table, so let's add a policy for it

CREATE POLICY "KV store is publicly readable" ON public.kv_store_c952a926 FOR SELECT USING (true);