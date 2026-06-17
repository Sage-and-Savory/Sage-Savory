-- Create an enum for subscription tiers
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the user_usage table
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    text_generations_used INT NOT NULL DEFAULT 0,
    camera_scans_used INT NOT NULL DEFAULT 0,
    gallery_scans_used INT NOT NULL DEFAULT 0,
    last_reset_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Grant permissions for user_usage
GRANT SELECT, INSERT, UPDATE ON public.user_usage TO authenticated;

-- Policies for user_usage
DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_usage;
CREATE POLICY "Users can view their own usage"
    ON public.user_usage FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON public.user_usage;
CREATE POLICY "Users can insert their own usage"
    ON public.user_usage FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own usage" ON public.user_usage;
CREATE POLICY "Users can update their own usage"
    ON public.user_usage FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create the user_cloud_state table
CREATE TABLE IF NOT EXISTS public.user_cloud_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_state JSONB,
    recipes JSONB,
    meal_plan JSONB,
    grocery_list JSONB,
    favorites JSONB,
    ratings JSONB,
    cooked_history JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_cloud_state
ALTER TABLE public.user_cloud_state ENABLE ROW LEVEL SECURITY;

-- Grant permissions for user_cloud_state
GRANT SELECT, INSERT, UPDATE ON public.user_cloud_state TO authenticated;

-- Policies for user_cloud_state
DROP POLICY IF EXISTS "Users can view their own cloud state" ON public.user_cloud_state;
CREATE POLICY "Users can view their own cloud state"
    ON public.user_cloud_state FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cloud state" ON public.user_cloud_state;
CREATE POLICY "Users can insert their own cloud state"
    ON public.user_cloud_state FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cloud state" ON public.user_cloud_state;
CREATE POLICY "Users can update their own cloud state"
    ON public.user_cloud_state FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to reset daily usage counters
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.user_usage
    SET text_generations_used = 0,
        camera_scans_used = 0,
        gallery_scans_used = 0,
        last_reset_date = NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule the reset function to run every night at midnight using pg_cron
-- Note: Requires the pg_cron extension to be enabled in your Supabase project.
SELECT cron.schedule('reset_daily_usage_job', '0 0 * * *', $$SELECT public.reset_daily_usage()$$);
