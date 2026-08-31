-- ============================================================
-- Indexes for faster orders + order_items queries
-- Run in Supabase SQL Editor
-- ============================================================

-- orders: fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders (user_id);

-- orders: fast lookup by status
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders (status);

-- orders: fast sorting by created_at
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders (created_at DESC);

-- composite index: user + status + date (covers most queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date
  ON orders (user_id, status, created_at DESC);

-- order_items: fast lookup by order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id);

-- order_items: fast join to products
CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items (product_id);

-- orderpayments_logs: fast lookup by order_id
CREATE INDEX IF NOT EXISTS idx_orderpayments_logs_order_id
  ON orderpayments_logs (order_id);
