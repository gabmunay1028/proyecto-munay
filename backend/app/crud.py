"""
Operaciones sobre la base de datos (consultar, crear, actualizar, dar de baja).
"""
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .models import Producto
from .schemas import ProductoEntrada


def _filtrar_por_texto(consulta, buscar: str | None):
    """Agrega a la consulta el filtro por nombre o código (si hay texto)."""
    texto = (buscar or "").strip()
    if not texto:
        return consulta
    # icontains = "contiene", sin distinguir mayúsculas (ILIKE '%texto%' en SQL).
    # autoescape evita que % o _ escritos por el usuario actúen como comodines.
    return consulta.where(
        or_(
            Producto.nombre.icontains(texto, autoescape=True),
            Producto.codigo.icontains(texto, autoescape=True),
        )
    )


def listar(db: Session, buscar: str | None = None, stock: str | None = None) -> list[Producto]:
    """
    Productos activos ordenados por nombre.
      - buscar: filtra por nombre o código.
      - stock: "con" = cantidad mayor que 0; "sin" = cantidad igual a 0; "todos" = sin filtro.
    Los dos filtros se pueden combinar.
    """
    consulta = select(Producto).where(Producto.activo.is_(True))

    if stock == "con":
        consulta = consulta.where(Producto.cantidad > 0)
    elif stock == "sin":
        consulta = consulta.where(Producto.cantidad == 0)

    consulta = _filtrar_por_texto(consulta, buscar)
    consulta = consulta.order_by(Producto.nombre)
    return list(db.scalars(consulta))


def listar_eliminados(db: Session, buscar: str | None = None) -> list[Producto]:
    """
    Productos eliminados (dados de baja), del más reciente al más antiguo.
    Los que no tienen fecha (eliminados antes de guardar la fecha) van al final.
    """
    consulta = select(Producto).where(Producto.activo.is_(False))
    consulta = _filtrar_por_texto(consulta, buscar)
    consulta = consulta.order_by(Producto.eliminado_en.desc().nulls_last(), Producto.nombre)
    return list(db.scalars(consulta))


def listar_categorias(db: Session) -> list[str]:
    """Categorías de los productos activos, sin repetir y en orden alfabético."""
    consulta = (
        select(Producto.categoria)
        .where(Producto.activo.is_(True))
        .distinct()
        .order_by(Producto.categoria)
    )
    return list(db.scalars(consulta))


def obtener(db: Session, producto_id: int) -> Producto | None:
    """Un producto activo por su id; None si no existe o fue dado de baja."""
    producto = db.get(Producto, producto_id)
    if producto is None or not producto.activo:
        return None
    return producto


def buscar_por_codigo(db: Session, codigo: str) -> Producto | None:
    """Busca por código exacto, INCLUYENDO los dados de baja (su código sigue ocupado)."""
    return db.scalar(select(Producto).where(Producto.codigo == codigo))


def crear(db: Session, datos: ProductoEntrada) -> Producto:
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)  
    return producto


def actualizar(db: Session, producto: Producto, datos: ProductoEntrada) -> Producto:
    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


def dar_de_baja(db: Session, producto: Producto) -> None:
    """
    Quita el producto del catálogo sin borrarlo físicamente (baja lógica).
    """
    producto.activo = False
    producto.eliminado_en = func.now()  
    db.commit()
