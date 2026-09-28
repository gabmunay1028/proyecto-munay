"""
Pruebas del filtro de stock: GET /productos?stock=con|sin

Regla acordada: "sin stock" = cantidad igual a 0; "con stock" = cantidad mayor que 0.

Ejecutar desde la carpeta backend:
    pytest -v
"""


def crear(cliente, codigo, nombre, cantidad):
    return cliente.post(
        "/productos",
        json={
            "codigo": codigo,
            "nombre": nombre,
            "categoria": "Abrigo",
            "precio": 50,
            "cantidad": cantidad,
        },
    )


def nombres(respuesta):
    return [producto["nombre"] for producto in respuesta.json()]


def test_filtra_productos_sin_stock_y_con_stock(cliente):
    crear(cliente, "POL-001", "Polera", 0)
    crear(cliente, "CAS-001", "Casaca", 10)
    crear(cliente, "CAM-001", "Camisa", 0)
    crear(cliente, "PIJ-001", "Pijama", 1)

    assert nombres(cliente.get("/productos", params={"stock": "sin"})) == ["Camisa", "Polera"]
    assert nombres(cliente.get("/productos", params={"stock": "con"})) == ["Casaca", "Pijama"]
    # Sin filtro se ven todos
    assert len(cliente.get("/productos").json()) == 4


def test_filtro_de_stock_se_combina_con_la_busqueda(cliente):
    crear(cliente, "POL-001", "Polera", 0)
    crear(cliente, "POL-002", "Polera oversize", 7)
    crear(cliente, "CAM-001", "Camisa", 0)

    respuesta = cliente.get("/productos", params={"buscar": "pol", "stock": "sin"})
    assert nombres(respuesta) == ["Polera"]


def test_editar_la_cantidad_mueve_el_producto_entre_filtros(cliente):
    casaca = crear(cliente, "CAS-001", "Casaca", 3).json()
    assert nombres(cliente.get("/productos", params={"stock": "sin"})) == []

    cliente.put(
        f"/productos/{casaca['id']}",
        json={"codigo": "CAS-001", "nombre": "Casaca", "categoria": "Abrigo", "precio": 50, "cantidad": 0},
    )
    assert nombres(cliente.get("/productos", params={"stock": "sin"})) == ["Casaca"]


def test_valor_de_filtro_invalido_responde_422_en_espanol(cliente):
    respuesta = cliente.get("/productos", params={"stock": "poco"})

    assert respuesta.status_code == 422
    assert respuesta.json()["detail"] == "El filtro de stock no es una opción válida."
