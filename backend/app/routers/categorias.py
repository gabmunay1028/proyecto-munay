"""
Ruta de categorías.

    GET /categorias -> categorías en uso (de productos activos), sin repetir

"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("", response_model=list[str], summary="Listar las categorías en uso")
def listar_categorias(db: Session = Depends(get_db)):
    return crud.listar_categorias(db)
