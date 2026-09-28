-- ============================================================
-- Agrega la fecha de eliminación a una base que ya existía.
-- ============================================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMP;
