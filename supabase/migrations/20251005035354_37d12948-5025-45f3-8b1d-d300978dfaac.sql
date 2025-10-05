-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base table for RAG
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('web', 'news', 'market_data', 'user_data', 'analysis')),
  relevance_score FLOAT DEFAULT 0,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on embeddings for fast similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx ON public.knowledge_base 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index on user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS knowledge_base_user_id_idx ON public.knowledge_base(user_id);

-- Create index on source_type
CREATE INDEX IF NOT EXISTS knowledge_base_source_type_idx ON public.knowledge_base(source_type);

-- Create index on content hash to avoid duplicates
CREATE INDEX IF NOT EXISTS knowledge_base_content_hash_idx ON public.knowledge_base(content_hash);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own knowledge base"
ON public.knowledge_base
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert into their own knowledge base"
ON public.knowledge_base
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own knowledge base"
ON public.knowledge_base
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base"
ON public.knowledge_base
FOR DELETE
USING (auth.uid() = user_id);

-- Function to search knowledge base by similarity
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source_url text,
  source_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    knowledge_base.source_url,
    knowledge_base.source_type,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 
    (filter_user_id IS NULL OR knowledge_base.user_id = filter_user_id OR knowledge_base.user_id IS NULL)
    AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();