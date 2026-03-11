
CREATE TABLE public.changelog_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  changes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.changelog_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read changelog"
  ON public.changelog_versions
  FOR SELECT
  USING (true);
