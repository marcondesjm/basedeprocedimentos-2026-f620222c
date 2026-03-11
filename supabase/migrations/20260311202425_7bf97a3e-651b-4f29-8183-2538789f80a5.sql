
CREATE POLICY "Authenticated users can insert supervisor messages"
  ON public.supervisor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update supervisor messages"
  ON public.supervisor_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete supervisor messages"
  ON public.supervisor_messages
  FOR DELETE
  TO authenticated
  USING (true);
