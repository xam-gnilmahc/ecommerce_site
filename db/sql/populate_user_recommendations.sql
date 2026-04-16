WITH candidates AS (
  SELECT
    ua.user_id,
    ua.product_id,
    ui.category,

    SUM(
      CASE
        WHEN ua.type = 'cart' THEN 5
        ELSE 1
      END
      *
      (1 / (1 + EXTRACT(EPOCH FROM (NOW() - ua.created_at)) / 86400))
    ) AS score

  FROM public.user_interest ui
  JOIN public.user_activity ua
    ON ua.user_id = ui.user_id

  WHERE ui.user_id = p_user_id
    AND ua.product_id IS NOT NULL

  GROUP BY ua.user_id, ua.product_id, ui.category
),

ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, category
      ORDER BY score DESC
    ) AS rn
  FROM candidates
),

top_candidates AS (
  SELECT *
  FROM ranked
  WHERE rn <= p_per_category_limit
)

INSERT INTO public.user_recommendations (
  user_id,
  product_id,
  category,
  score,
  created_at
)
SELECT
  user_id,
  product_id,
  category,
  score,
  NOW()
FROM top_candidates

ON CONFLICT (user_id, product_id)
DO UPDATE SET
  score = EXCLUDED.score,
  category = EXCLUDED.category,
  created_at = NOW();