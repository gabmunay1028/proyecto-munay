"""
Operaciones sobre la base de datos (consultar, crear, actualizar, dar de baja).

Estas funciones solo hablan con PostgreSQL. Las decisiones de "qué responder
al usuario" (404, 409, mensajes) se toman en routers/productos.py.
"""
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .models import Producto
from .schemas import ProductoEntrada


def listar(db: Session, buscar: str | None = None) -> list[Producto]:
    """Productos activos ordenados por nombre. Si hay texto, filtra por nombre o código."""
    consulta = select(Producto).where(Producto.activo.is_(True))

    texto = (buscar or "").strip()
    if texto:
        # icontains = "contiene", sin distinguir mayúsculas (ILIKE '%texto%' en SQL).
        # autoescape evita que % o _ escritos por el usuario actúen como comodines.
        consulta = consulta.where(
            or_(
                Producto.nombre.icontains(texto, autoescape=True),
                Producto.codigo.icontains(texto, autoescape=True),
            )
        )

    consulta = consulta.order_by(Producto.nombre)
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
    db.refresh(producto)  # recarga id y creado_en generados por PostgreSQL
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

    Si en la reunión se acuerda borrar definitivamente, basta con cambiar
    estas dos líneas por:  db.delete(producto) ; db.commit()
    """
    producto.activo = False
    db.commit()
