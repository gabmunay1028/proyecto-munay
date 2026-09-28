"""
Pruebas de la lista de productos eliminados: GET /productos/eliminados
"""


def crear(cliente, codigo, nombre):
    return cliente.post(
        "/productos",
        json={"codigo": codigo, "nombre": nombre, "categoria": "Abrigo", "precio": 50, "cantidad": 5},
    )


def nombres(respuesta):
    return [producto["nombre"] for producto in respuesta.json()]


def test_al_eliminar_pasa_a_la_lista_de_eliminados_con_su_fecha(cliente):
    assert cliente.get("/productos/eliminados").json() == []

    polera = crear(cliente, "POL-001", "Polera").json()
    crear(cliente, "CAS-001", "Casaca")
    cliente.delete(f"/productos/{polera['id']}")

    eliminados = cliente.get("/productos/eliminados").json()
    assert nombres(cliente.get("/productos/eliminados")) == ["Polera"]
    assert eliminados[0]["eliminado_en"] is not None
    # En el catálogo ya no aparece
    assert nombres(cliente.get("/productos")) == ["Casaca"]


def test_eliminados_se_pueden_buscar_y_el_mas_reciente_va_primero(cliente):
    for codigo, nombre in [("POL-001", "Polera"), ("CAM-001", "Camisa"), ("POL-002", "Polera oversize")]:
        producto = crear(cliente, codigo, nombre).json()
        cliente.delete(f"/productos/{producto['id']}")

    assert nombres(cliente.get("/productos/eliminados")) == ["Polera oversize", "Camisa", "Polera"]
    assert nombres(cliente.get("/productos/eliminados", params={"buscar": "pol"})) == [
        "Polera oversize",
        "Polera",
    ]


def test_reusar_el_codigo_de_un_eliminado_indica_donde_verlo(cliente):
    polera = crear(cliente, "POL-001", "Polera").json()
    cliente.delete(f"/productos/{polera['id']}")

    respuesta = crear(cliente, "pol-001", "Otra polera")

    assert respuesta.status_code == 409
    assert respuesta.json()["detail"] == (
        "El código POL-001 pertenece a un producto eliminado (Polera); "
        "puedes verlo en «Productos eliminados». Usa otro código."
    )


def test_la_ruta_eliminados_no_se_confunde_con_un_id(cliente):
    # Si la ruta estuviera después de /productos/{producto_id}, esto daría 422
    assert cliente.get("/productos/eliminados").status_code == 200
