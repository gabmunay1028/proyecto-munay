"""
Punto de entrada de la API.

Ejecutar desde la carpeta backend:
    uvicorn app.main:app --reload

Documentación interactiva (probar todas las rutas): http://localhost:8000/docs
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .errores import manejar_error_conexion, manejar_error_validacion
from .routers import productos

load_dotenv()

app = FastAPI(
    title="Catálogo de productos",
    description="API para registrar, buscar, actualizar y quitar productos del catálogo.",
    version="1.0.0",
)

# CORS: permite que el frontend (otro puerto) llame a esta API desde el navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Errores con mensajes en español
app.add_exception_handler(RequestValidationError, manejar_error_validacion)
app.add_exception_handler(OperationalError, manejar_error_conexion)

app.include_router(productos.router)


@app.get("/", tags=["Inicio"], summary="Comprobar que la API responde")
def inicio():
    return {"mensaje": "API del catálogo funcionando. Documentación en /docs"}
