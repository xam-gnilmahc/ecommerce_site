-- ============================================================
-- Product search — clean install
-- Run in Supabase SQL Editor
-- ============================================================

-- Trigram extension (for fast substring matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm
  ON products USING GIN (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category_trgm
  ON products USING GIN (category gin_trgm_ops);

-- Drop old FTS stuff if it exists
DROP TRIGGER IF EXISTS tsvector_products_update ON products;
DROP FUNCTION IF EXISTS products_search_vector_update();
DROP FUNCTION IF EXISTS search_products(text);
DROP INDEX IF EXISTS idx_products_search;
ALTER TABLE products DROP COLUMN IF EXISTS search_vector;

-- Simple search function
CREATE OR REPLACE FUNCTION search_products(query_text text)
RETURNS SETOF products AS $$
  SELECT *
  FROM products
  WHERE name ILIKE '%' || query_text || '%'
     OR brand ILIKE '%' || query_text || '%'
     OR category ILIKE '%' || query_text || '%'
     OR type ILIKE '%' || query_text || '%'
  ORDER BY
    CASE WHEN name ILIKE '%' || query_text || '%' THEN 0 ELSE 1 END,
    id DESC;
$$ LANGUAGE sql;
