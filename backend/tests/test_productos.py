"""
Pruebas automatizadas de las reglas de negocio del catálogo.

Ejecutar desde la carpeta backend:
    pytest -v
"""
import pytest

POLERA = {
    "codigo": "pol-001",
    "nombre": "Polera",
    "categoria": "Abrigo",
    "precio": 59.9,
    "cantidad": 25,
}


def crear(cliente, **cambios):
    """Crea un producto partiendo de POLERA y cambiando solo lo indicado."""
    return cliente.post("/productos", json={**POLERA, **cambios})


# ---------- Regla principal: el código no se puede repetir ----------

def test_no_permite_registrar_dos_productos_con_el_mismo_codigo(cliente):
    assert crear(cliente).status_code == 201

    # Mismo código escrito en mayúsculas: debe considerarse repetido
    respuesta = crear(cliente, codigo="POL-001", nombre="Otra polera")

    assert respuesta.status_code == 409
    assert respuesta.json()["detail"] == "Ya existe un producto con el código POL-001 (Polera)."
    assert len(cliente.get("/productos").json()) == 1  # no se guardó el segundo


def test_al_editar_no_permite_usar_el_codigo_de_otro_producto(cliente):
    polera = crear(cliente).json()
    casaca = crear(cliente, codigo="CAS-001", nombre="Casaca").json()

    respuesta = cliente.put(f"/productos/{casaca['id']}", json={**POLERA, "nombre": "Casaca"})
    assert respuesta.status_code == 409

    # Editar un producto conservando su propio código sí está permitido
    respuesta = cliente.put(f"/productos/{polera['id']}", json={**POLERA, "precio": 49.9})
    assert respuesta.status_code == 200
    assert respuesta.json()["precio"] == 49.9


# ---------- Registro y validaciones ----------

def test_registra_producto_valido_y_normaliza_los_datos(cliente):
    respuesta = crear(cliente, codigo="  pol-001 ", nombre="  Polera  ")

    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert datos["codigo"] == "POL-001"
    assert datos["nombre"] == "Polera"
    assert datos["precio"] == 59.9


@pytest.mark.parametrize("precio", [0, -10])
def test_rechaza_precio_cero_o_negativo(cliente, precio):
    respuesta = crear(cliente, precio=precio)

    assert respuesta.status_code == 422
    assert respuesta.json()["errores"]["precio"] == "El precio debe ser mayor que 0."


def test_rechaza_cantidad_negativa_o_con_decimales(cliente):
    assert crear(cliente, cantidad=-1).json()["errores"]["cantidad"] == (
        "La cantidad debe ser mayor o igual a 0."
    )
    assert crear(cliente, cantidad=2.5).status_code == 422


def test_rechaza_campos_vacios_u_obligatorios(cliente):
    datos_incompletos = {**POLERA, "nombre": "   "}
    del datos_incompletos["categoria"]

    errores = cliente.post("/productos", json=datos_incompletos).json()["errores"]

    assert errores["nombre"] == "El nombre no puede estar vacío."
    assert errores["categoria"] == "La categoría es obligatoria."


# ---------- Búsqueda ----------

def test_busca_por_nombre_o_codigo_sin_distinguir_mayusculas(cliente):
    crear(cliente)
    crear(cliente, codigo="CAS-001", nombre="Casaca")

    por_nombre = cliente.get("/productos", params={"buscar": "CASA"}).json()
    por_codigo = cliente.get("/productos", params={"buscar": "pol-001"}).json()
    sin_resultado = cliente.get("/productos", params={"buscar": "xyz"}).json()

    assert [p["nombre"] for p in por_nombre] == ["Casaca"]
    assert [p["nombre"] for p in por_codigo] == ["Polera"]
    assert sin_resultado == []


# ---------- Quitar del catálogo ----------

def test_quitar_producto_lo_saca_del_catalogo(cliente):
    polera = crear(cliente).json()

    respuesta = cliente.delete(f"/productos/{polera['id']}")

    assert respuesta.status_code == 200
    assert respuesta.json()["mensaje"] == "Se quitó «Polera» del catálogo."
    assert cliente.get("/productos").json() == []
    assert cliente.get(f"/productos/{polera['id']}").status_code == 404


def test_producto_inexistente_devuelve_404_con_mensaje(cliente):
    respuesta = cliente.delete("/productos/999")

    assert respuesta.status_code == 404
    assert respuesta.json()["detail"] == "No se encontró el producto con id 999."
