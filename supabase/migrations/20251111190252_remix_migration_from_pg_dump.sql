--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    solution text NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pib_equipamento text,
    usuario_atendido text
);


--
-- Name: procedures procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_pkey PRIMARY KEY (id);


--
-- Name: idx_procedures_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_category ON public.procedures USING btree (category);


--
-- Name: idx_procedures_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_tags ON public.procedures USING gin (tags);


--
-- Name: idx_procedures_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_title ON public.procedures USING btree (title);


--
-- Name: procedures update_procedures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: procedures Anyone can create procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create procedures" ON public.procedures FOR INSERT WITH CHECK (true);


--
-- Name: procedures Anyone can delete procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete procedures" ON public.procedures FOR DELETE USING (true);


--
-- Name: procedures Anyone can update procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update procedures" ON public.procedures FOR UPDATE USING (true);


--
-- Name: procedures Anyone can view procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view procedures" ON public.procedures FOR SELECT USING (true);


--
-- Name: procedures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


