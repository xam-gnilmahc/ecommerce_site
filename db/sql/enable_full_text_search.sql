-- ============================================================
-- Product search — uses existing search_vector + GIN index
-- Run in Supabase SQL Editor
-- ============================================================

-- Drop old search function if it exists
DROP FUNCTION IF EXISTS search_products(text);

-- Fast search using the existing search_vector column + GIN index
CREATE OR REPLACE FUNCTION search_products(query_text text)
RETURNS SETOF products AS $$
DECLARE
  words text[];
  tsquery_str text;
BEGIN
  -- Split into words: "iphone17 pro" → ['iphone','17','pro']
  words := ARRAY(
    SELECT DISTINCT lower(unnest(
      regexp_split_to_array(trim(lower(query_text)), '\s+')
    ))
  );

  -- Further split on digit-letter boundaries
  words := ARRAY(
    SELECT DISTINCT unnest(
      regexp_split_to_array(w, '(?<=\D)(?=\d)|(?<=\d)(?=\D)')
    )
    FROM unnest(words) AS w
    WHERE length(w) > 0
  );

  -- Build tsquery: 'iphone' & '17' & 'pro'
  tsquery_str := array_to_string(
    ARRAY(SELECT unnest(words)), ' & '
  );

  -- Fallback if nothing to search
  IF tsquery_str = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT *
  FROM products
  WHERE search_vector @@ to_tsquery('english', tsquery_str)
  ORDER BY ts_rank(search_vector, to_tsquery('english', tsquery_str)) DESC,
           id DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql;
