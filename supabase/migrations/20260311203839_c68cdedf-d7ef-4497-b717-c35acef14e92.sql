
ALTER TABLE public.supervisor_messages 
ADD COLUMN scheduled_at timestamp with time zone DEFAULT NULL,
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Update SELECT policy to also show scheduled messages to authenticated users (for management)
DROP POLICY IF EXISTS "Anyone can read active supervisor messages" ON public.supervisor_messages;

CREATE POLICY "Anyone can read active scheduled supervisor messages"
ON public.supervisor_messages
FOR SELECT
TO public
USING (
  active = true 
  AND (scheduled_at IS NULL OR scheduled_at <= now())
  AND (expires_at IS NULL OR expires_at > now())
);

-- Authenticated users can read ALL messages (for management view)
CREATE POLICY "Authenticated users can read all supervisor messages"
ON public.supervisor_messages
FOR SELECT
TO authenticated
USING (true);
