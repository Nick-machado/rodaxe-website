-- Add main_video_url field for the main video displayed in the center
ALTER TABLE public.portfolio_projects
ADD COLUMN main_video_url TEXT;