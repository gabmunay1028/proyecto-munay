"""
Manejo de errores con mensajes en español.

Pydantic responde en inglés por defecto ("Input should be greater than 0").
Aquí se traducen esos errores para que el frontend pueda mostrarle al usuario
exactamente por qué no se guardó su producto.

Formato de respuesta de error (siempre igual, para que React lo lea fácil):
    {
      "detail": "El precio debe ser mayor que 0.",      <- texto listo para mostrar
      "errores": {"precio": "El precio debe ser mayor que 0."}   <- por campo
    }
"""
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

# Nombre legible de cada campo y su terminación de género (o/a)
CAMPOS = {
    "codigo": ("El código", "o"),
    "nombre": ("El nombre", "o"),
    "categoria": ("La categoría", "a"),
    "precio": ("El precio", "o"),
    "cantidad": ("La cantidad", "a"),
    "producto_id": ("El identificador del producto", "o"),
}


def _traducir(tipo: str, ctx: dict, genero: str) -> str:
    """Convierte un tipo de error de Pydantic en una frase en español."""
    mensajes = {
        "missing": f"es obligatori{genero}",
        "string_too_short": f"no puede estar vací{genero}",
        "string_too_long": f"no puede tener más de {ctx.get('max_length')} caracteres",
        "string_type": "debe ser texto",
        "greater_than": f"debe ser mayor que {ctx.get('gt')}",
        "greater_than_equal": f"debe ser mayor o igual a {ctx.get('ge')}",
        "int_parsing": "debe ser un número entero",
        "int_type": "debe ser un número entero",
        "int_from_float": "debe ser un número entero (sin decimales)",
        "decimal_parsing": "debe ser un número",
        "decimal_type": "debe ser un número",
        "decimal_max_places": f"puede tener como máximo {ctx.get('decimal_places')} decimales",
        "decimal_max_digits": "es demasiado grande",
        "decimal_whole_digits": "es demasiado grande",
    }
    return mensajes.get(tipo, "tiene un valor no válido")


async def manejar_error_validacion(request: Request, exc: RequestValidationError):
    errores: dict[str, str] = {}

    for error in exc.errors():
        ubicacion = error.get("loc", ())
        campo = str(ubicacion[-1]) if len(ubicacion) > 1 else None

        if campo in CAMPOS:
            etiqueta, genero = CAMPOS[campo]
            mensaje = f"{etiqueta} {_traducir(error['type'], error.get('ctx', {}), genero)}."
        else:
            campo = "general"
            mensaje = "Los datos enviados no tienen el formato esperado."

        errores.setdefault(campo, mensaje)  # un mensaje por campo (el primero)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"detail": " ".join(errores.values()), "errores": errores},
    )


async def manejar_error_conexion(request: Request, exc: OperationalError):
    """Si PostgreSQL está apagado o la contraseña es incorrecta, lo decimos claramente."""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "No se pudo conectar con la base de datos. "
            "Verifica que PostgreSQL esté encendido y que el archivo .env sea correcto."
        },
    )
