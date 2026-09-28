-- ============================================================
-- Tabla de productos del catálogo
-- Ejecutar en pgAdmin (Herramienta de consultas) sobre la base "catalogo".
-- Usa IF NOT EXISTS: volver a ejecutarlo no borra ni duplica nada.
-- ============================================================

CREATE TABLE IF NOT EXISTS productos (
    id         SERIAL        PRIMARY KEY,
    codigo     VARCHAR(20)   NOT NULL,
    nombre     VARCHAR(100)  NOT NULL,
    categoria  VARCHAR(50)   NOT NULL,
    precio     NUMERIC(10,2) NOT NULL,          -- NUMERIC y no FLOAT: evita errores de redondeo con dinero
    cantidad   INTEGER       NOT NULL,
    activo     BOOLEAN       NOT NULL DEFAULT TRUE,  -- FALSE = dado de baja (ya no aparece en el catálogo)
    creado_en  TIMESTAMP     NOT NULL DEFAULT NOW(),

    -- Reglas que la base protege aunque falle todo lo demás
    CONSTRAINT productos_codigo_unico        UNIQUE (codigo),
    CONSTRAINT productos_precio_valido       CHECK (precio > 0),
    CONSTRAINT productos_cantidad_valida     CHECK (cantidad >= 0),
    CONSTRAINT productos_codigo_no_vacio     CHECK (length(trim(codigo)) > 0),
    CONSTRAINT productos_nombre_no_vacio     CHECK (length(trim(nombre)) > 0),
    CONSTRAINT productos_categoria_no_vacia  CHECK (length(trim(categoria)) > 0)
);
