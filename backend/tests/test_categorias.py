"""
Pruebas de la ruta de categorías.

"""


def crear(cliente, codigo, nombre, categoria):
    return cliente.post(
        "/productos",
        json={
            "codigo": codigo,
            "nombre": nombre,
            "categoria": categoria,
            "precio": 50,
            "cantidad": 5,
        },
    )


def test_categorias_sin_repetir_ordenadas_y_solo_de_productos_activos(cliente):
    assert cliente.get("/categorias").json() == []

    crear(cliente, "POL-001", "Polera", "Abrigo")
    crear(cliente, "CAS-001", "Casaca", "Abrigo")
    crear(cliente, "PIJ-001", "Pijama", "Ropa de dormir")
    camisa = crear(cliente, "CAM-001", "Camisa", "Camisas").json()

    # "Abrigo" aparece una sola vez y la lista está en orden alfabético
    assert cliente.get("/categorias").json() == ["Abrigo", "Camisas", "Ropa de dormir"]

    # Al quitar el único producto de "Camisas", esa categoría deja de ofrecerse
    cliente.delete(f"/productos/{camisa['id']}")
    assert cliente.get("/categorias").json() == ["Abrigo", "Ropa de dormir"]
