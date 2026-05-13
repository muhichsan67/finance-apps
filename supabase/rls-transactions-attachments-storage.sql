-- Run in Supabase Dashboard → SQL Editor (as project owner).
-- Fixes: "new row violates row-level security policy" when uploading attachments
-- or inserting into transaction_attachments.
--
-- App behavior:
-- - Storage paths: attachments / user_<auth.uid>/transactions/<tx_id>/...
-- - Tables: transactions.user_id = auth.uid(), transaction_attachments.transaction_id → transactions

-- ---------------------------------------------------------------------------
-- public.transactions
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
CREATE POLICY "transactions_update_own"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- public.transaction_attachments
-- ---------------------------------------------------------------------------
ALTER TABLE public.transaction_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transaction_attachments_select_own" ON public.transaction_attachments;
CREATE POLICY "transaction_attachments_select_own"
  ON public.transaction_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      WHERE t.id = transaction_attachments.transaction_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transaction_attachments_insert_own" ON public.transaction_attachments;
CREATE POLICY "transaction_attachments_insert_own"
  ON public.transaction_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      WHERE t.id = transaction_attachments.transaction_id
        AND t.user_id = auth.uid()
    )
    AND created_by = auth.uid()
    AND updated_by = auth.uid()
  );

DROP POLICY IF EXISTS "transaction_attachments_update_own" ON public.transaction_attachments;
CREATE POLICY "transaction_attachments_update_own"
  ON public.transaction_attachments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      WHERE t.id = transaction_attachments.transaction_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      WHERE t.id = transaction_attachments.transaction_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transaction_attachments_delete_own" ON public.transaction_attachments;
CREATE POLICY "transaction_attachments_delete_own"
  ON public.transaction_attachments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      WHERE t.id = transaction_attachments.transaction_id
        AND t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: bucket "attachments" (storage.objects)
-- ---------------------------------------------------------------------------
-- Ensure bucket exists (skip error if it already does)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "attachments_insert_own_prefix" ON storage.objects;
CREATE POLICY "attachments_insert_own_prefix"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND split_part(name, '/', 1) = 'user_' || auth.uid()::text
  );

DROP POLICY IF EXISTS "attachments_select_own_prefix" ON storage.objects;
CREATE POLICY "attachments_select_own_prefix"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND split_part(name, '/', 1) = 'user_' || auth.uid()::text
  );

DROP POLICY IF EXISTS "attachments_update_own_prefix" ON storage.objects;
CREATE POLICY "attachments_update_own_prefix"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND split_part(name, '/', 1) = 'user_' || auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'attachments'
    AND split_part(name, '/', 1) = 'user_' || auth.uid()::text
  );

DROP POLICY IF EXISTS "attachments_delete_own_prefix" ON storage.objects;
CREATE POLICY "attachments_delete_own_prefix"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND split_part(name, '/', 1) = 'user_' || auth.uid()::text
  );
