
CREATE TABLE public.supervisor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supervisor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active supervisor messages"
  ON public.supervisor_messages
  FOR SELECT
  USING (active = true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.supervisor_messages;
