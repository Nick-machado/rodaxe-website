CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: forma_pagamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.forma_pagamento AS ENUM (
    'dinheiro',
    'cartao',
    'pix',
    'transferencia',
    'boleto',
    'outro'
);


--
-- Name: status_recebimento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_recebimento AS ENUM (
    'pendente',
    'pago',
    'cancelado'
);


--
-- Name: status_trabalho; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_trabalho AS ENUM (
    'novo',
    'em_andamento',
    'aguardando_cliente',
    'aguardando_pagamento',
    'concluido',
    'cancelado'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_atualizado_em_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_atualizado_em_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: acoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.acoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trabalho_id uuid,
    cliente_id uuid,
    data_inicio timestamp with time zone NOT NULL,
    descricao text NOT NULL,
    custo numeric,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    data_fim timestamp with time zone
);


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_ou_razao text NOT NULL,
    documento text NOT NULL,
    email text,
    telefone text,
    whatsapp boolean DEFAULT false,
    endereco text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);


--
-- Name: custos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid,
    data timestamp with time zone NOT NULL,
    valor numeric NOT NULL,
    categoria text NOT NULL,
    descricao text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);


--
-- Name: niches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.niches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    featured_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recebimentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recebimentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trabalho_id uuid,
    cliente_id uuid,
    data timestamp with time zone NOT NULL,
    valor numeric NOT NULL,
    forma_pagamento public.forma_pagamento NOT NULL,
    status public.status_recebimento DEFAULT 'pendente'::public.status_recebimento NOT NULL,
    descricao text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trabalhos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trabalhos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid,
    titulo text NOT NULL,
    descricao text,
    briefing_texto text,
    briefing_anexos jsonb DEFAULT '[]'::jsonb,
    status public.status_trabalho DEFAULT 'novo'::public.status_trabalho NOT NULL,
    data_inicio date,
    data_entrega_prevista date,
    data_conclusao date,
    valor_estimado numeric,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    arquivos_finais jsonb DEFAULT '[]'::jsonb,
    valor_recebido numeric DEFAULT 0
);


--
-- Name: unique_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unique_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text DEFAULT (gen_random_uuid())::text NOT NULL,
    tipo text NOT NULL,
    alvo_id uuid NOT NULL,
    url text,
    expira_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_links_tipo_check CHECK ((tipo = ANY (ARRAY['trabalho'::text, 'briefing'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: video_niches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_niches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    niche_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: video_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: acoes acoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acoes
    ADD CONSTRAINT acoes_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: custos custos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custos
    ADD CONSTRAINT custos_pkey PRIMARY KEY (id);


--
-- Name: niches niches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.niches
    ADD CONSTRAINT niches_pkey PRIMARY KEY (id);


--
-- Name: niches niches_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.niches
    ADD CONSTRAINT niches_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: recebimentos recebimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recebimentos
    ADD CONSTRAINT recebimentos_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: trabalhos trabalhos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabalhos
    ADD CONSTRAINT trabalhos_pkey PRIMARY KEY (id);


--
-- Name: unique_links unique_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unique_links
    ADD CONSTRAINT unique_links_pkey PRIMARY KEY (id);


--
-- Name: unique_links unique_links_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unique_links
    ADD CONSTRAINT unique_links_token_key UNIQUE (token);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: video_niches video_niches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_niches
    ADD CONSTRAINT video_niches_pkey PRIMARY KEY (id);


--
-- Name: video_niches video_niches_video_id_niche_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_niches
    ADD CONSTRAINT video_niches_video_id_niche_id_key UNIQUE (video_id, niche_id);


--
-- Name: video_tags video_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_pkey PRIMARY KEY (id);


--
-- Name: video_tags video_tags_video_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_video_id_tag_id_key UNIQUE (video_id, tag_id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: acoes update_acoes_atualizado_em; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_acoes_atualizado_em BEFORE UPDATE ON public.acoes FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em_column();


--
-- Name: clientes update_clientes_atualizado_em; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clientes_atualizado_em BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em_column();


--
-- Name: custos update_custos_atualizado_em; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custos_atualizado_em BEFORE UPDATE ON public.custos FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em_column();


--
-- Name: niches update_niches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_niches_updated_at BEFORE UPDATE ON public.niches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recebimentos update_recebimentos_atualizado_em; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recebimentos_atualizado_em BEFORE UPDATE ON public.recebimentos FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em_column();


--
-- Name: trabalhos update_trabalhos_atualizado_em; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_trabalhos_atualizado_em BEFORE UPDATE ON public.trabalhos FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em_column();


--
-- Name: videos update_videos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: acoes acoes_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acoes
    ADD CONSTRAINT acoes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: acoes acoes_trabalho_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acoes
    ADD CONSTRAINT acoes_trabalho_id_fkey FOREIGN KEY (trabalho_id) REFERENCES public.trabalhos(id) ON DELETE CASCADE;


--
-- Name: custos custos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custos
    ADD CONSTRAINT custos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: recebimentos recebimentos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recebimentos
    ADD CONSTRAINT recebimentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: recebimentos recebimentos_trabalho_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recebimentos
    ADD CONSTRAINT recebimentos_trabalho_id_fkey FOREIGN KEY (trabalho_id) REFERENCES public.trabalhos(id) ON DELETE CASCADE;


--
-- Name: trabalhos trabalhos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabalhos
    ADD CONSTRAINT trabalhos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: video_niches video_niches_niche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_niches
    ADD CONSTRAINT video_niches_niche_id_fkey FOREIGN KEY (niche_id) REFERENCES public.niches(id) ON DELETE CASCADE;


--
-- Name: video_niches video_niches_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_niches
    ADD CONSTRAINT video_niches_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_tags video_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: video_tags video_tags_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: acoes Admins can delete acoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete acoes" ON public.acoes FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clientes Admins can delete clientes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete clientes" ON public.clientes FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custos Admins can delete custos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete custos" ON public.custos FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: niches Admins can delete niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete niches" ON public.niches FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: recebimentos Admins can delete recebimentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete recebimentos" ON public.recebimentos FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tags Admins can delete tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete tags" ON public.tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: trabalhos Admins can delete trabalhos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete trabalhos" ON public.trabalhos FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: unique_links Admins can delete unique_links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete unique_links" ON public.unique_links FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: video_niches Admins can delete video_niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete video_niches" ON public.video_niches FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: video_tags Admins can delete video_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete video_tags" ON public.video_tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: videos Admins can delete videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete videos" ON public.videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: acoes Admins can insert acoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert acoes" ON public.acoes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clientes Admins can insert clientes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert clientes" ON public.clientes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custos Admins can insert custos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert custos" ON public.custos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: niches Admins can insert niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert niches" ON public.niches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: recebimentos Admins can insert recebimentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert recebimentos" ON public.recebimentos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tags Admins can insert tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: trabalhos Admins can insert trabalhos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert trabalhos" ON public.trabalhos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: unique_links Admins can insert unique_links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert unique_links" ON public.unique_links FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: video_niches Admins can insert video_niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert video_niches" ON public.video_niches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: video_tags Admins can insert video_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert video_tags" ON public.video_tags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: videos Admins can insert videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: acoes Admins can update acoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update acoes" ON public.acoes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clientes Admins can update clientes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update clientes" ON public.clientes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custos Admins can update custos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update custos" ON public.custos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: niches Admins can update niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update niches" ON public.niches FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: recebimentos Admins can update recebimentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update recebimentos" ON public.recebimentos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tags Admins can update tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update tags" ON public.tags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: trabalhos Admins can update trabalhos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update trabalhos" ON public.trabalhos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: videos Admins can update videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update videos" ON public.videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: acoes Admins can view acoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view acoes" ON public.acoes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clientes Admins can view clientes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view clientes" ON public.clientes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custos Admins can view custos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view custos" ON public.custos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: recebimentos Admins can view recebimentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view recebimentos" ON public.recebimentos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: trabalhos Admins can view trabalhos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view trabalhos" ON public.trabalhos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: unique_links Admins can view unique_links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view unique_links" ON public.unique_links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: niches Anyone can view niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view niches" ON public.niches FOR SELECT TO authenticated, anon USING (true);


--
-- Name: tags Anyone can view tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT TO authenticated, anon USING (true);


--
-- Name: video_niches Anyone can view video_niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view video_niches" ON public.video_niches FOR SELECT TO authenticated, anon USING (true);


--
-- Name: video_tags Anyone can view video_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view video_tags" ON public.video_tags FOR SELECT TO authenticated, anon USING (true);


--
-- Name: videos Anyone can view videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT TO authenticated, anon USING (true);


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: acoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;

--
-- Name: clientes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

--
-- Name: custos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;

--
-- Name: niches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: recebimentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recebimentos ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: trabalhos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trabalhos ENABLE ROW LEVEL SECURITY;

--
-- Name: unique_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.unique_links ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: video_niches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_niches ENABLE ROW LEVEL SECURITY;

--
-- Name: video_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;