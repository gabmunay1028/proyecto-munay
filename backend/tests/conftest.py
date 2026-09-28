"""
Configuración compartida de las pruebas.

Las pruebas usan una base APARTE (DATABASE_URL_TEST) para no tocar los datos
reales. Antes de cada prueba se borra y se vuelve a crear la tabla usando el
mismo script sql/01_crear_tabla.sql, así también se comprueba que el script funciona.
"""
import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

URL_PRUEBAS = os.getenv("DATABASE_URL_TEST")
if not URL_PRUEBAS:
    pytest.exit("Falta DATABASE_URL_TEST en el archivo .env", returncode=1)
if URL_PRUEBAS == os.getenv("DATABASE_URL"):
    pytest.exit("DATABASE_URL_TEST debe apuntar a OTRA base: las pruebas borran la tabla.", returncode=1)

from app.database import get_db  # noqa: E402  (se importa después de validar el .env)
from app.main import app  # noqa: E402

motor_pruebas = create_engine(URL_PRUEBAS)
SesionPruebas = sessionmaker(bind=motor_pruebas, autoflush=False)
SCRIPT_TABLA = Path(__file__).resolve().parent.parent / "sql" / "01_crear_tabla.sql"


def _get_db_pruebas():
    db = SesionPruebas()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def cliente():
    """Cliente HTTP de prueba con la tabla productos vacía."""
    with motor_pruebas.begin() as conexion:
        conexion.exec_driver_sql("DROP TABLE IF EXISTS productos")
        conexion.exec_driver_sql(SCRIPT_TABLA.read_text(encoding="utf-8"))

    # Las rutas usarán la base de pruebas en lugar de la principal
    app.dependency_overrides[get_db] = _get_db_pruebas
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
