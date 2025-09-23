-- Create personalized news analysis table
CREATE TABLE public.personalized_news_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL,
  analysis_content TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  recommendations TEXT,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personalized_news_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own news analysis" 
ON public.personalized_news_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own news analysis" 
ON public.personalized_news_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news analysis" 
ON public.personalized_news_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news analysis" 
ON public.personalized_news_analysis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_personalized_news_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personalized_news_analysis_updated_at
BEFORE UPDATE ON public.personalized_news_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_personalized_news_analysis_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_personalized_news_analysis_user_id ON public.personalized_news_analysis(user_id);
CREATE INDEX idx_personalized_news_analysis_article_id ON public.personalized_news_analysis(article_id);
CREATE INDEX idx_personalized_news_analysis_created_at ON public.personalized_news_analysis(created_at DESC);