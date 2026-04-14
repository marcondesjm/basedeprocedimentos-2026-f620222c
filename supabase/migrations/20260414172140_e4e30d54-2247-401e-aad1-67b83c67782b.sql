
-- ============================================
-- completed_work_orders: auth-only
-- ============================================
DROP POLICY IF EXISTS "Anyone can view completed work orders" ON public.completed_work_orders;
DROP POLICY IF EXISTS "Anyone can create completed work orders" ON public.completed_work_orders;
DROP POLICY IF EXISTS "Anyone can delete completed work orders" ON public.completed_work_orders;

CREATE POLICY "Authenticated users can view completed work orders" ON public.completed_work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create completed work orders" ON public.completed_work_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete completed work orders" ON public.completed_work_orders FOR DELETE TO authenticated USING (true);

-- ============================================
-- procedures: auth-only
-- ============================================
DROP POLICY IF EXISTS "Anyone can view procedures" ON public.procedures;
DROP POLICY IF EXISTS "Anyone can create procedures" ON public.procedures;
DROP POLICY IF EXISTS "Anyone can update procedures" ON public.procedures;
DROP POLICY IF EXISTS "Anyone can delete procedures" ON public.procedures;

CREATE POLICY "Authenticated users can view procedures" ON public.procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create procedures" ON public.procedures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update procedures" ON public.procedures FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete procedures" ON public.procedures FOR DELETE TO authenticated USING (true);

-- ============================================
-- activity_logs: auth-only
-- ============================================
DROP POLICY IF EXISTS "Anyone can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Anyone can create activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- app_config: auth-only
-- ============================================
DROP POLICY IF EXISTS "Anyone can read app_config" ON public.app_config;
DROP POLICY IF EXISTS "Anyone can insert app_config" ON public.app_config;
DROP POLICY IF EXISTS "Anyone can update app_config" ON public.app_config;

CREATE POLICY "Authenticated users can read app_config" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert app_config" ON public.app_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update app_config" ON public.app_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- supervisor_messages: restrict write to supervisor email
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can insert supervisor messages" ON public.supervisor_messages;
DROP POLICY IF EXISTS "Authenticated users can update supervisor messages" ON public.supervisor_messages;
DROP POLICY IF EXISTS "Authenticated users can delete supervisor messages" ON public.supervisor_messages;

CREATE POLICY "Supervisor can insert messages" ON public.supervisor_messages FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'supervisores.hepta@gmail.com');
CREATE POLICY "Supervisor can update messages" ON public.supervisor_messages FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'supervisores.hepta@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'supervisores.hepta@gmail.com');
CREATE POLICY "Supervisor can delete messages" ON public.supervisor_messages FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'supervisores.hepta@gmail.com');
