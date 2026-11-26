-- Split the flat `cart` table into:
--   public.cart        → one row per user (the cart itself)
--   public.cart_items  → the products inside it
--
-- Before: every add-to-cart inserted a new row in `cart`, so a user had one row
-- per product and the cart had no header at all.
--
-- Run this once in the Supabase SQL editor. It migrates existing carts.
-- The whole thing runs in one transaction, so a failure leaves the old table
-- untouched and the script can simply be run again.

BEGIN;

-- 1. Move the current flat rows aside so the name `cart` is free for the parent.
ALTER TABLE public.cart RENAME TO cart_legacy;

-- 2. Parent: exactly one cart per user.
CREATE TABLE public.cart (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON public.cart
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart"
  ON public.cart
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON public.cart
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
  ON public.cart
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Child: the actual items, one row per product.
CREATE TABLE public.cart_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id BIGINT NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One row per product: adding the same product again bumps the quantity.
  CONSTRAINT cart_items_cart_product_key UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items"
  ON public.cart_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cart c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cart c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cart c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cart c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

-- 4. Migrate the existing rows: one cart per user, then its items.
--
-- The old table stored user_id as text while the new one uses uuid, so the
-- values are matched against auth.users instead of cast blindly: that fixes the
-- type mismatch and also drops rows whose user no longer exists, which would
-- otherwise violate the new foreign key.
CREATE TEMP TABLE cart_legacy_rows AS
SELECT
  u.id AS user_id,
  p.id AS product_id,
  l.amount::numeric(10, 2) AS amount,
  GREATEST(COALESCE(l.quantity::int, 1), 1) AS quantity
FROM public.cart_legacy l
JOIN auth.users u ON u.id::text = lower(btrim(l.user_id::text))
JOIN public.products p ON p.id::text = btrim(l.product_id::text)
WHERE l.user_id IS NOT NULL
  AND l.product_id IS NOT NULL
  AND l.amount IS NOT NULL;

INSERT INTO public.cart (user_id)
SELECT DISTINCT user_id
FROM cart_legacy_rows
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.cart_items (cart_id, product_id, amount, quantity)
SELECT c.id, l.product_id, l.amount, l.quantity
FROM cart_legacy_rows l
JOIN public.cart c ON c.user_id = l.user_id
ON CONFLICT (cart_id, product_id) DO NOTHING;

DROP TABLE cart_legacy_rows;

DROP TABLE public.cart_legacy;

COMMIT;
