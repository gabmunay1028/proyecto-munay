"""
Esquemas de Pydantic: definen qué datos ENTRAN y SALEN de la API.
"""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Mayor número que cabe en una columna INTEGER de PostgreSQL.
CANTIDAD_MAXIMA = 2_147_483_647


class ProductoEntrada(BaseModel):
    """Datos que envía el formulario para crear o editar un producto."""

    # Quita espacios al inicio y al final de todos los textos ("  Polera " -> "Polera")
    model_config = ConfigDict(str_strip_whitespace=True)

    codigo: str = Field(min_length=1, max_length=20, examples=["POL-002"])
    nombre: str = Field(min_length=1, max_length=100, examples=["Polera oversize"])
    categoria: str = Field(min_length=1, max_length=50, examples=["Abrigo"])
    precio: Decimal = Field(gt=0, max_digits=10, decimal_places=2, examples=[64.90])
    cantidad: int = Field(ge=0, le=CANTIDAD_MAXIMA, examples=[12])

    @field_validator("codigo")
    @classmethod
    def codigo_en_mayusculas(cls, valor: str) -> str:
        # "pol-001" y "POL-001" deben considerarse el mismo código
        return valor.upper()


class ProductoSalida(BaseModel):
    """Lo que la API devuelve de cada producto."""

    # Permite construir la respuesta directamente desde el modelo de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nombre: str
    categoria: str
    precio: float  
    cantidad: int
    creado_en: datetime


class ProductoEliminado(ProductoSalida):
    """Producto eliminado: los mismos datos más la fecha en que se eliminó."""

    eliminado_en: datetime | None  


class Mensaje(BaseModel):
    """Respuesta simple con un texto para mostrar al usuario."""

    mensaje: str
