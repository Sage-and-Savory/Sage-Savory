-- Add UPSERT policy for user_usage
CREATE POLICY "Users can update their own usage"
    ON public.user_usage FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own usage"
    ON public.user_usage FOR INSERT
    WITH CHECK (auth.uid() = id);
