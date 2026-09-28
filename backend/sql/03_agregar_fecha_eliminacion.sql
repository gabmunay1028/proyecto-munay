-- ============================================================
-- Agrega la fecha de eliminación a una base que ya existía.
-- Ejecutar UNA vez en pgAdmin (Herramienta de consultas) sobre la base "catalogo".
--
-- En instalaciones nuevas no hace falta (01_crear_tabla.sql ya incluye la columna),
-- pero ejecutarlo igual no hace daño gracias a IF NOT EXISTS.
-- Los productos eliminados antes de este cambio quedan sin fecha (NULL).
-- ============================================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMP;
