-- Create portfolio_projects table
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  cover_image_url TEXT NOT NULL,
  project_date DATE,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_media table for images/videos within each project
CREATE TABLE public.portfolio_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;

-- Public can view published projects
CREATE POLICY "Anyone can view published projects"
ON public.portfolio_projects
FOR SELECT
USING (is_published = true);

-- Admins can do everything on projects
CREATE POLICY "Admins can insert projects"
ON public.portfolio_projects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update projects"
ON public.portfolio_projects
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete projects"
ON public.portfolio_projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all projects"
ON public.portfolio_projects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view media of published projects
CREATE POLICY "Anyone can view media of published projects"
ON public.portfolio_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects
    WHERE portfolio_projects.id = portfolio_media.project_id
    AND portfolio_projects.is_published = true
  )
);

-- Admins can do everything on media
CREATE POLICY "Admins can insert media"
ON public.portfolio_media
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update media"
ON public.portfolio_media
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete media"
ON public.portfolio_media
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all media"
ON public.portfolio_media
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on projects
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_portfolio_projects_slug ON public.portfolio_projects(slug);
CREATE INDEX idx_portfolio_projects_published ON public.portfolio_projects(is_published);
CREATE INDEX idx_portfolio_media_project ON public.portfolio_media(project_id);
CREATE INDEX idx_portfolio_media_type ON public.portfolio_media(type);

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND has_role(auth.uid(), 'admin'::app_role));