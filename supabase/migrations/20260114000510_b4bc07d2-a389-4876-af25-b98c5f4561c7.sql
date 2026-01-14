-- Add cover_video_url field to portfolio_projects
ALTER TABLE public.portfolio_projects
ADD COLUMN cover_video_url TEXT;