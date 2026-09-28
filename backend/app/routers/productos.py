"""
Rutas de la API para productos.

    GET    /productos?buscar=texto&stock=todos|con|sin
                                     -> lista (filtra por nombre o código y por stock)
    GET    /productos/eliminados?buscar=texto
                                     -> productos eliminados (el más reciente primero)
    GET    /productos/{id}           -> consulta un producto
    POST   /productos                -> crea
    PUT    /productos/{id}           -> actualiza
    DELETE /productos/{id}           -> quita del catálogo (baja lógica)
"""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Producto
from ..schemas import Mensaje, ProductoEliminado, ProductoEntrada, ProductoSalida

router = APIRouter(prefix="/productos", tags=["Productos"])


# ---------- Funciones de apoyo ----------

def _obtener_o_404(db: Session, producto_id: int) -> Producto:
    producto = crud.obtener(db, producto_id)
    if producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el producto con id {producto_id}.",
        )
    return producto


def _validar_codigo_disponible(db: Session, codigo: str, excepto_id: int | None = None) -> None:
    """Regla de negocio: dos productos no pueden tener el mismo código."""
    existente = crud.buscar_por_codigo(db, codigo)
    if existente is None or existente.id == excepto_id:
        return

    if existente.activo:
        detalle = f"Ya existe un producto con el código {codigo} ({existente.nombre})."
    else:
        detalle = (
            f"El código {codigo} pertenece a un producto eliminado ({existente.nombre}); "
            "puedes verlo en «Productos eliminados». Usa otro código."
        )
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detalle)


def _guardar(db: Session, operacion, codigo: str):
    """
    Ejecuta crear/actualizar. Si dos personas guardan el mismo código a la vez,
    la validación previa no alcanza y PostgreSQL lo rechaza: lo traducimos a 409.
    """
    try:
        return operacion()
    except IntegrityError as error:
        db.rollback()
        if "productos_codigo_unico" in str(error.orig):
            detalle = f"Ya existe un producto con el código {codigo}."
        else:
            detalle = "No se pudo guardar: los datos no cumplen las reglas de la base de datos."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detalle)


# ---------- Rutas ----------

@router.get("", response_model=list[ProductoSalida], summary="Listar y buscar productos")
def listar_productos(
    buscar: str | None = Query(
        default=None,
        max_length=100,
        description="Texto a buscar en el nombre o el código (no distingue mayúsculas).",
    ),
    # Tres valores fijos: en /docs se muestra como lista desplegable
    stock: Literal["todos", "con", "sin"] = Query(
        default="todos",
        description='"todos" = sin filtro; "con" = cantidad mayor que 0; "sin" = cantidad igual a 0.',
    ),
    db: Session = Depends(get_db),
):
    return crud.listar(db, buscar, stock)



@router.get(
    "/eliminados",
    response_model=list[ProductoEliminado],
    summary="Listar productos eliminados",
)
def listar_eliminados(
    buscar: str | None = Query(
        default=None,
        max_length=100,
        description="Texto a buscar en el nombre o el código de los productos eliminados.",
    ),
    db: Session = Depends(get_db),
):
    return crud.listar_eliminados(db, buscar)


@router.get("/{producto_id}", response_model=ProductoSalida, summary="Consultar un producto")
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    return _obtener_o_404(db, producto_id)


@router.post(
    "",
    response_model=ProductoSalida,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un producto",
)
def crear_producto(datos: ProductoEntrada, db: Session = Depends(get_db)):
    _validar_codigo_disponible(db, datos.codigo)
    return _guardar(db, lambda: crud.crear(db, datos), datos.codigo)


@router.put("/{producto_id}", response_model=ProductoSalida, summary="Actualizar un producto")
def actualizar_producto(producto_id: int, datos: ProductoEntrada, db: Session = Depends(get_db)):
    producto = _obtener_o_404(db, producto_id)
    _validar_codigo_disponible(db, datos.codigo, excepto_id=producto_id)
    return _guardar(db, lambda: crud.actualizar(db, producto, datos), datos.codigo)


@router.delete("/{producto_id}", response_model=Mensaje, summary="Quitar un producto del catálogo")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = _obtener_o_404(db, producto_id)
    crud.dar_de_baja(db, producto)
    return Mensaje(mensaje=f"Se quitó «{producto.nombre}» del catálogo.")
