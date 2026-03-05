
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Anyone can update app_config" ON public.app_config FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert app_config" ON public.app_config FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_config;

INSERT INTO public.app_config (key, value) VALUES ('current_version', '2.6.0');
