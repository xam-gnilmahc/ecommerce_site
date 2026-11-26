-- Invoices as real PDFs instead of a browser print window.
--
-- Every placed order gets a PDF in Supabase Storage under
--   invoices/<user_id>/invoice-<order_id>.pdf
-- and its public URL is saved on the order row.
--
-- Run this once in the Supabase SQL editor.

BEGIN;

-- 1. Link column on the order.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS invoice_url text;

-- 2. Public bucket for the files (the app builds its URL with getPublicUrl).
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 3. Storage policies: a signed-in user may write only inside their own folder.
DROP POLICY IF EXISTS "Users can upload their own invoices" ON storage.objects;
CREATE POLICY "Users can upload their own invoices"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can replace their own invoices" ON storage.objects;
CREATE POLICY "Users can replace their own invoices"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Invoices are readable by link (the bucket is public, like product images).
DROP POLICY IF EXISTS "Invoices are readable by link" ON storage.objects;
CREATE POLICY "Invoices are readable by link"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'invoices');

-- 4. Let the owner write `invoice_url` on their own order and nothing else.
--    The column-level grant keeps totals, status and addresses out of reach.
GRANT UPDATE (invoice_url) ON public.orders TO authenticated;

DROP POLICY IF EXISTS "Users can attach an invoice to their own order" ON public.orders;
CREATE POLICY "Users can attach an invoice to their own order"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;
