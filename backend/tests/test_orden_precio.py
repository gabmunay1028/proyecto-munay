"""
Pruebas del orden por precio: GET /productos?orden=nombre|precio_asc|precio_desc
"""


def crear(cliente, codigo, nombre, precio, cantidad=5):
    return cliente.post(
        "/productos",
        json={"codigo": codigo, "nombre": nombre, "categoria": "Abrigo", "precio": precio, "cantidad": cantidad},
    )


def nombres(respuesta):
    return [producto["nombre"] for producto in respuesta.json()]


def preparar(cliente):
    crear(cliente, "CAS-001", "Casaca", 129.90)
    crear(cliente, "POL-001", "Polera", 59.90, cantidad=0)
    crear(cliente, "CAM-001", "Camisa", 79.90)
    crear(cliente, "BUF-001", "Bufanda", 59.90)  # mismo precio que Polera


def test_por_defecto_ordena_por_nombre(cliente):
    preparar(cliente)
    assert nombres(cliente.get("/productos")) == ["Bufanda", "Camisa", "Casaca", "Polera"]


def test_ordena_por_precio_de_menor_a_mayor_con_desempate_por_nombre(cliente):
    preparar(cliente)
    respuesta = cliente.get("/productos", params={"orden": "precio_asc"})
    assert nombres(respuesta) == ["Bufanda", "Polera", "Camisa", "Casaca"]
    precios = [producto["precio"] for producto in respuesta.json()]
    assert precios == sorted(precios)


def test_ordena_por_precio_de_mayor_a_menor(cliente):
    preparar(cliente)
    assert nombres(cliente.get("/productos", params={"orden": "precio_desc"})) == [
        "Casaca",
        "Camisa",
        "Bufanda",
        "Polera",
    ]


def test_el_orden_se_combina_con_filtro_de_stock_y_busqueda(cliente):
    preparar(cliente)
    con_stock = cliente.get("/productos", params={"stock": "con", "orden": "precio_desc"})
    assert nombres(con_stock) == ["Casaca", "Camisa", "Bufanda"]

    busqueda = cliente.get("/productos", params={"buscar": "ca", "orden": "precio_asc"})
    assert nombres(busqueda) == ["Camisa", "Casaca"]


def test_valor_de_orden_invalido_responde_422_en_espanol(cliente):
    respuesta = cliente.get("/productos", params={"orden": "barato"})

    assert respuesta.status_code == 422
    assert respuesta.json()["detail"] == "El orden no es una opción válida."
