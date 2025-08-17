-- Agent memory for AI Financial Agent
CREATE TABLE IF NOT EXISTS public.ai_agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ai_agent_memory ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own ai memory" ON public.ai_agent_memory;
CREATE POLICY "Users can manage their own ai memory"
ON public.ai_agent_memory
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_agent_memory_user ON public.ai_agent_memory (user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS tr_ai_agent_memory_updated_at ON public.ai_agent_memory;
CREATE TRIGGER tr_ai_agent_memory_updated_at
BEFORE UPDATE ON public.ai_agent_memory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();