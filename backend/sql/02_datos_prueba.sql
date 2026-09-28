-- ============================================================
-- Datos ficticios iniciales del catálogo (5 productos)
-- ============================================================

INSERT INTO productos (codigo, nombre, categoria, precio, cantidad) VALUES
    ('POL-001', 'Polera',   'Abrigo',         59.90, 25),
    ('CAS-001', 'Casaca',   'Abrigo',        129.90, 10),
    ('PIJ-001', 'Pijama',   'Ropa de dormir', 69.90, 15),
    ('PAN-001', 'Pantalón', 'Pantalones',     89.90, 20),
    ('CAM-001', 'Camisa',   'Camisas',        79.90, 18)
ON CONFLICT (codigo) DO NOTHING;
