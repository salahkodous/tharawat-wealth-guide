-- Create portfolio_goals table for investment-specific goals
CREATE TABLE public.portfolio_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'portfolio_value', 'sector_allocation', 'return_target', 'asset_target'
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_percentage NUMERIC, -- for allocation and return goals
  asset_type TEXT, -- for sector allocation goals
  target_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own portfolio goals" 
ON public.portfolio_goals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_portfolio_goals_updated_at
BEFORE UPDATE ON public.portfolio_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();