"""
Conexión a PostgreSQL.

"""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "Falta la variable DATABASE_URL. Copia .env.example como .env y complétala."
    )

# El motor administra las conexiones con PostgreSQL
engine = create_engine(DATABASE_URL)

# Fábrica de sesiones: cada sesión es una "conversación" con la base
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """Clase base de la que heredan los modelos (tablas)."""


def get_db():
    """Abre una sesión para la petición y la cierra al terminar, pase lo que pase."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
