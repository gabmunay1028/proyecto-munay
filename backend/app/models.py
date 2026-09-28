"""
Modelo de la tabla productos.

La tabla se crea con sql/01_crear_tabla.sql; esta clase solo le dice a
SQLAlchemy cómo es, para poder leerla y escribirla desde Python.
Si cambias una columna aquí, cámbiala también en el script SQL.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True)
    nombre: Mapped[str] = mapped_column(String(100))
    categoria: Mapped[str] = mapped_column(String(50))
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    cantidad: Mapped[int] = mapped_column(Integer)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
