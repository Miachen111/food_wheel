-- 002_extend_budget_level.sql
-- 擴充 budget_level 約束以支援第四級預算等級 '$$$$'（Requirement 7.1）。
-- 不修改已套用的 001_create_tables.sql，改以新遷移前滾。

ALTER TABLE restaurants
  DROP CONSTRAINT IF EXISTS restaurants_budget_level_check;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_budget_level_check
  CHECK (budget_level IS NULL OR budget_level IN ('$', '$$', '$$$', '$$$$'));
