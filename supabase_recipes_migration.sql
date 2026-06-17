-- 1. Create the dedicated recipes table
CREATE TABLE recipes (
  id TEXT PRIMARY KEY, -- Using TEXT because frontend uses string IDs like 'mex_2'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT,
  time TEXT,
  difficulty TEXT,
  base_servings INTEGER,
  region TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB,
  detailed_steps JSONB,
  instructions JSONB,
  picky_hack TEXT,
  kid_plating_hack TEXT,
  is_plan_b BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- 3. Establish Policies for Strict Data Isolation
-- SELECT
CREATE POLICY "Users can view their own recipes" 
ON recipes FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert their own recipes" 
ON recipes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own recipes" 
ON recipes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own recipes" 
ON recipes FOR DELETE 
USING (auth.uid() = user_id);
