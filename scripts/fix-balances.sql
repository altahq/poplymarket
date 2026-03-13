-- Fix user token balances after sell payout bug.
-- Correct balance = 1000 (initial)
--   - total amount spent on active bets
--   - total amount spent on sold bets
--   + correct sell payout for sold bets (floor(amount * 0.98))
--
-- Run this in the Supabase SQL Editor.

-- First, preview what the fix will do (DRY RUN):
WITH user_active_spend AS (
  SELECT user_name, COALESCE(SUM(amount), 0) AS active_spent
  FROM bets
  WHERE status = 'active'
  GROUP BY user_name
),
user_sold AS (
  SELECT user_name,
         COALESCE(SUM(amount), 0) AS sold_spent,
         COALESCE(SUM(FLOOR(amount * 0.98)), 0) AS correct_sell_payout
  FROM bets
  WHERE status = 'sold'
  GROUP BY user_name
)
SELECT
  u.name,
  u.tokens AS current_tokens,
  1000
    - COALESCE(a.active_spent, 0)
    - COALESCE(s.sold_spent, 0)
    + COALESCE(s.correct_sell_payout, 0) AS correct_tokens,
  u.tokens - (
    1000
    - COALESCE(a.active_spent, 0)
    - COALESCE(s.sold_spent, 0)
    + COALESCE(s.correct_sell_payout, 0)
  ) AS difference
FROM users u
LEFT JOIN user_active_spend a ON a.user_name = u.name
LEFT JOIN user_sold s ON s.user_name = u.name
ORDER BY difference DESC;

-- Once you've reviewed the output above, uncomment and run the UPDATE below:

-- UPDATE users u
-- SET tokens = 1000
--   - COALESCE(a.active_spent, 0)
--   - COALESCE(s.sold_spent, 0)
--   + COALESCE(s.correct_sell_payout, 0)
-- FROM (
--   SELECT user_name, COALESCE(SUM(amount), 0) AS active_spent
--   FROM bets WHERE status = 'active'
--   GROUP BY user_name
-- ) a
-- FULL OUTER JOIN (
--   SELECT user_name,
--          COALESCE(SUM(amount), 0) AS sold_spent,
--          COALESCE(SUM(FLOOR(amount * 0.98)), 0) AS correct_sell_payout
--   FROM bets WHERE status = 'sold'
--   GROUP BY user_name
-- ) s ON s.user_name = a.user_name
-- WHERE u.name = COALESCE(a.user_name, s.user_name);
