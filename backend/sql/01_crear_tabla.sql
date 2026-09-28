-- ============================================================
-- Tabla de productos del catálogo
-- ============================================================

CREATE TABLE IF NOT EXISTS productos (
    id         SERIAL        PRIMARY KEY,
    codigo     VARCHAR(20)   NOT NULL,
    nombre     VARCHAR(100)  NOT NULL,
    categoria  VARCHAR(50)   NOT NULL,
    precio     NUMERIC(10,2) NOT NULL,          
    cantidad   INTEGER       NOT NULL,
    activo     BOOLEAN       NOT NULL DEFAULT TRUE,  
    creado_en  TIMESTAMP     NOT NULL DEFAULT NOW(),
    eliminado_en TIMESTAMP   NULL,              

    -- Reglas que la base protege aunque falle todo lo demás
    CONSTRAINT productos_codigo_unico        UNIQUE (codigo),
    CONSTRAINT productos_precio_valido       CHECK (precio > 0),
    CONSTRAINT productos_cantidad_valida     CHECK (cantidad >= 0),
    CONSTRAINT productos_codigo_no_vacio     CHECK (length(trim(codigo)) > 0),
    CONSTRAINT productos_nombre_no_vacio     CHECK (length(trim(nombre)) > 0),
    CONSTRAINT productos_categoria_no_vacia  CHECK (length(trim(categoria)) > 0)
);
