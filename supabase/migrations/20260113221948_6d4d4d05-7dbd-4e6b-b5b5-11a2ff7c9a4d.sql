-- Drop storage policies that depend on has_role function
DROP POLICY IF EXISTS "Admins can delete briefings" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update briefings" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload briefings" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view briefings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;

-- Now drop everything else

-- Drop all tables (CASCADE will handle remaining dependencies)
DROP TABLE IF EXISTS public.portfolio_media CASCADE;
DROP TABLE IF EXISTS public.portfolio_projects CASCADE;
DROP TABLE IF EXISTS public.video_tags CASCADE;
DROP TABLE IF EXISTS public.video_niches CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.niches CASCADE;
DROP TABLE IF EXISTS public.unique_links CASCADE;
DROP TABLE IF EXISTS public.recebimentos CASCADE;
DROP TABLE IF EXISTS public.custos CASCADE;
DROP TABLE IF EXISTS public.acoes CASCADE;
DROP TABLE IF EXISTS public.trabalhos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions with CASCADE
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.update_atualizado_em_column CASCADE;

-- Drop enums
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.status_trabalho CASCADE;
DROP TYPE IF EXISTS public.status_recebimento CASCADE;
DROP TYPE IF EXISTS public.forma_pagamento CASCADE;

-- Delete storage buckets content and buckets
DELETE FROM storage.objects WHERE bucket_id = 'portfolio';
DELETE FROM storage.objects WHERE bucket_id = 'media';
DELETE FROM storage.objects WHERE bucket_id = 'briefings';
DELETE FROM storage.buckets WHERE id = 'portfolio';
DELETE FROM storage.buckets WHERE id = 'media';
DELETE FROM storage.buckets WHERE id = 'briefings';