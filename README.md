# Catálogo de productos — Prueba Full Stack Junior

Aplicación web para registrar, buscar, actualizar y quitar productos del catálogo de una empresa comercial.

- **Backend:** Python + FastAPI + SQLAlchemy
- **Base de datos:** PostgreSQL
- **Frontend:** React (Vite) — *en construcción*

---

## Objetivo

> *(Completar después de la reunión con el responsable del negocio.)*

## Alcance acordado

> *(Completar con las definiciones finales recibidas.)*

## Decisiones y supuestos

| Tema | Decisión actual | Estado |
|---|---|---|
| Quitar un producto | Baja lógica: se marca `activo = FALSE` y deja de aparecer; no se borra de la base | Por confirmar |
| Código | Obligatorio, único, máx. 20 caracteres. Se guarda en mayúsculas (`pol-001` = `POL-001`) | Por confirmar |
| Código de un producto dado de baja | Sigue ocupado; no se puede reutilizar | Por confirmar |
| Categoría | Texto libre, máx. 50 caracteres | Por confirmar |
| Precio | Mayor que 0, hasta 2 decimales, tipo `NUMERIC(10,2)` | Por confirmar |
| Cantidad | Número entero mayor o igual a 0 | Por confirmar |
| Búsqueda | Por nombre **o** código, texto parcial, sin distinguir mayúsculas | Por confirmar |
| Textos | Se quitan los espacios al inicio y al final | — |
| Validación | En tres niveles: formulario (React), API (Pydantic) y base de datos (restricciones) | — |
| Mensajes de error | Siempre en español, con el formato `{"detail": "...", "errores": {campo: mensaje}}` | — |

## Estructura

```
catalogo-productos/
├── backend/
│   ├── app/
│   │   ├── main.py            # crea la API, CORS y manejo de errores
│   │   ├── database.py        # conexión a PostgreSQL
│   │   ├── models.py          # tabla productos (SQLAlchemy)
│   │   ├── schemas.py         # validaciones de entrada y salida (Pydantic)
│   │   ├── crud.py            # consultas a la base
│   │   ├── errores.py         # traducción de errores al español
│   │   └── routers/
│   │       └── productos.py   # rutas y reglas de negocio
│   ├── sql/
│   │   ├── 01_crear_tabla.sql
│   │   └── 02_datos_prueba.sql
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_productos.py
│   ├── .env.example
│   ├── pytest.ini
│   └── requirements.txt
└── frontend/                  # (pendiente)
```

## Rutas de la API

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/productos?buscar=texto` | Lista los productos activos; filtra por nombre o código | 200 |
| GET | `/productos/{id}` | Consulta un producto | 200 · 404 |
| POST | `/productos` | Registra un producto | 201 · 409 código repetido · 422 datos inválidos |
| PUT | `/productos/{id}` | Actualiza un producto | 200 · 404 · 409 · 422 |
| DELETE | `/productos/{id}` | Quita el producto del catálogo | 200 · 404 |

Si PostgreSQL no está disponible, la API responde **503** con un mensaje claro.
Documentación interactiva: **http://localhost:8000/docs**

---

## Cómo ejecutarlo

**Requisitos:** Python 3.10 o superior, PostgreSQL 14 o superior (con pgAdmin) y Node.js 20 o superior (para el frontend).

### 1. Preparar la base de datos

1. En pgAdmin crea dos bases: **`catalogo`** y **`catalogo_test`**
   (clic derecho en *Databases* → *Create* → *Database…*).
2. Selecciona la base `catalogo`, abre la **Herramienta de consultas** (*Query Tool*) y ejecuta, en este orden:
   - `backend/sql/01_crear_tabla.sql`
   - `backend/sql/02_datos_prueba.sql` (carga 5 productos ficticios)
3. La base `catalogo_test` no necesita scripts: las pruebas crean su tabla solas.

Alternativa por consola:
```bash
psql -U postgres -c "CREATE DATABASE catalogo;"
psql -U postgres -c "CREATE DATABASE catalogo_test;"
psql -U postgres -d catalogo -f backend/sql/01_crear_tabla.sql
psql -U postgres -d catalogo -f backend/sql/02_datos_prueba.sql
```

### 2. Levantar el backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # Windows  (Mac/Linux: cp .env.example .env)
```

Abre `.env` y reemplaza `TU_CLAVE` por la contraseña de tu usuario de PostgreSQL. Luego:

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Documentación y pruebas manuales: http://localhost:8000/docs

> Si PowerShell no deja activar el entorno, ejecuta una vez
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` o usa la terminal *Command Prompt*.

### 3. Ejecutar las pruebas automatizadas

Desde la carpeta `backend`, con el entorno activado:

```bash
pytest -v
```

Las pruebas usan **solo** la base `catalogo_test` (se vacía en cada prueba). Si por error apuntara a la misma base que `DATABASE_URL`, se detienen sin tocar nada.

Reglas de negocio cubiertas:
- No se pueden registrar dos productos con el mismo código (sin importar mayúsculas).
- Al editar, no se puede usar el código de otro producto.
- Precio mayor que 0; cantidad entera y no negativa; campos obligatorios y no vacíos.
- La búsqueda encuentra por nombre o código.
- Un producto quitado deja de aparecer en el listado y en la consulta.

---

## Comprobaciones manuales (backend)

Realizadas desde http://localhost:8000/docs.

| # | Acción | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | Listar productos sin filtro | 200 con los 5 productos iniciales, ordenados por nombre | |
| 2 | Registrar producto válido con código en minúsculas | 201; el código se guarda en mayúsculas | |
| 3 | Registrar con un código que ya existe | 409 "Ya existe un producto con el código …" | |
| 4 | Registrar con precio 0, cantidad -3 y nombre vacío | 422 con los tres mensajes en español | |
| 5 | Registrar con precio de 3 decimales | 422 "El precio puede tener como máximo 2 decimales." | |
| 6 | Buscar `pol` | Solo los productos que contienen "pol" en nombre o código | |
| 7 | Buscar `xyz` | 200 con lista vacía | |
| 8 | Consultar id inexistente (999) | 404 "No se encontró el producto con id 999." | |
| 9 | Editar un producto usando el código de otro | 409 | |
| 10 | Quitar un producto | 200 "Se quitó «…» del catálogo." y ya no aparece en el listado | |
| 11 | Apagar PostgreSQL y listar | 503 "No se pudo conectar con la base de datos…" | |

## Pendientes

- Frontend en React (catálogo, buscador, formulario de registro y edición, mensajes).
- Confirmar las decisiones marcadas como "Por confirmar".

## Tiempo efectivo aproximado

> *(Completar.)*

## Herramientas utilizadas

> *(Completar: documentación consultada, librerías, uso de IA y cómo se comprobó el resultado.)*
