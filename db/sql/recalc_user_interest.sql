CREATE OR REPLACE FUNCTION public.recalc_user_interest(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- safety check
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.user_interest (user_id, category, score)
  SELECT
    user_id,
    type AS category,
    SUM(
      CASE LOWER(type)
        WHEN 'purchase' THEN 1
        WHEN 'cart' THEN 1
        WHEN 'product_view' THEN 1
        WHEN 'search' THEN 1
        ELSE 0
      END
    ) AS score
  FROM public.user_activity
  WHERE user_id = p_user_id
    AND type IS NOT NULL
  GROUP BY user_id, type
  ORDER BY score DESC

  ON CONFLICT (user_id, category)
  DO UPDATE SET
    score = EXCLUDED.score;

END;
$$;