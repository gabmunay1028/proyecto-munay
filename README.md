# Catálogo de productos — Prueba Full Stack Junior

Aplicación web para registrar, buscar, actualizar y quitar productos del catálogo de una empresa comercial.

- **Backend:** Python + FastAPI + SQLAlchemy
- **Base de datos:** PostgreSQL
- **Frontend:** React + Vite + React Router

---

## Objetivo

> *(Completar después de la reunión con el responsable del negocio.)*

## Alcance acordado

> *(Completar con las definiciones finales recibidas.)*

## Decisiones y supuestos

| Tema | Decisión actual | Estado |
|---|---|---|
| Quitar un producto | Baja lógica: se marca `activo = FALSE` y deja de aparecer; no se borra de la base. Se pide confirmación antes | Por confirmar |
| Código | Obligatorio, único, máx. 20 caracteres. Se guarda en mayúsculas (`pol-001` = `POL-001`) | Por confirmar |
| Código de un producto dado de baja | Sigue ocupado; no se puede reutilizar | Por confirmar |
| Categoría | Se elige de una lista con las categorías registradas o se crea una nueva (máx. 50 caracteres). Si se escribe una que ya existe con otras mayúsculas (`abrigo`), se usa la registrada (`Abrigo`) | Mejora propuesta, por confirmar |
| Precio | En soles (S/), mayor que 0, hasta 2 decimales, tipo `NUMERIC(10,2)` | Por confirmar |
| Cantidad | Número entero entre 0 y 2 147 483 647 (límite de `INTEGER`) | Por confirmar |
| Búsqueda | Por nombre **o** código, texto parcial, sin distinguir mayúsculas | Por confirmar |
| Páginas | Dos: catálogo (listado, buscador, eliminar) y formulario (registrar y editar) | — |
| Textos | Se quitan los espacios al inicio y al final | — |
| Validación | En tres niveles: formulario (React), API (Pydantic) y base de datos (restricciones) | — |
| Mensajes de error | Siempre en español, con el formato `{"detail": "...", "errores": {campo: mensaje}}` | — |

## Estructura

```
proyecto-aimunay/
├── backend/
│   ├── app/
│   │   ├── main.py            # crea la API, CORS y manejo de errores
│   │   ├── database.py        # conexión a PostgreSQL
│   │   ├── models.py          # tabla productos (SQLAlchemy)
│   │   ├── schemas.py         # validaciones de entrada y salida (Pydantic)
│   │   ├── crud.py            # consultas a la base
│   │   ├── errores.py         # traducción de errores al español
│   │   └── routers/
│   │       ├── productos.py   # rutas y reglas de negocio
│   │       └── categorias.py  # lista de categorías en uso
│   ├── sql/
│   │   ├── 01_crear_tabla.sql
│   │   └── 02_datos_prueba.sql
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_productos.py
│   │   └── test_categorias.py
│   ├── .env.example
│   ├── pytest.ini
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── productos.js           # todas las llamadas al backend
    │   ├── components/
    │   │   ├── Aviso.jsx              # mensaje de éxito o error
    │   │   ├── Buscador.jsx
    │   │   ├── ProductoCard.jsx       # tarjeta con Editar y Eliminar
    │   │   └── SelectorCategoria.jsx  # lista de categorías + opción nueva
    │   ├── pages/
    │   │   ├── Catalogo/
    │   │   │   └── Catalogo.jsx               # página principal
    │   │   └── FormularioProducto/
    │   │       └── FormularioProducto.jsx     # registrar y editar
    │   ├── utils/
    │   │   └── validaciones.js        # mismas reglas que el backend
    │   ├── config.js                  # dirección del backend y nombre de la empresa
    │   ├── App.jsx                    # rutas de la aplicación
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    └── package.json
```

## Rutas de la API

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/productos?buscar=texto` | Lista los productos activos; filtra por nombre o código | 200 |
| GET | `/productos/{id}` | Consulta un producto | 200 · 404 |
| POST | `/productos` | Registra un producto | 201 · 409 código repetido · 422 datos inválidos |
| PUT | `/productos/{id}` | Actualiza un producto | 200 · 404 · 409 · 422 |
| DELETE | `/productos/{id}` | Quita el producto del catálogo | 200 · 404 |
| GET | `/categorias` | Categorías de los productos activos, sin repetir y en orden alfabético | 200 |

Si PostgreSQL no está disponible, la API responde **503** con un mensaje claro y registra la causa exacta en el terminal.
Documentación interactiva: **http://localhost:8000/docs**

## Páginas del frontend

| Dirección | Página |
|---|---|
| `/` | Catálogo: bienvenida, buscador, tarjetas con Editar y Eliminar |
| `/productos/nuevo` | Formulario para registrar un producto |
| `/productos/{id}/editar` | El mismo formulario, cargado con los datos del producto |

---

## Cómo ejecutarlo

**Requisitos:** Python 3.10 o superior, PostgreSQL 14 o superior (con pgAdmin) y Node.js 20.19 o superior.

### 1. Preparar la base de datos

1. En pgAdmin crea dos bases: **`catalogo`** y **`catalogo_test`**
   (clic derecho en *Databases* → *Create* → *Database…*).
2. Selecciona la base `catalogo`, abre la **Herramienta de consultas** (*Query Tool*) y ejecuta, en este orden:
   - `backend/sql/01_crear_tabla.sql`
   - `backend/sql/02_datos_prueba.sql` (carga 5 productos ficticios)
3. La base `catalogo_test` no necesita scripts: las pruebas crean su tabla solas.

### 2. Levantar el backend (terminal 1)

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
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
> Si cambias el `.env`, reinicia `uvicorn` (Ctrl+C y de nuevo): `--reload` no vuelve a leer ese archivo.

### 3. Levantar el frontend (terminal 2)

```bash
cd frontend
npm install
copy .env.example .env          # Windows  (Mac/Linux: cp .env.example .env)
npm run dev
```

Abre **http://localhost:5173**. El backend debe estar encendido.

### 4. Ejecutar las pruebas automatizadas

Desde la carpeta `backend`, con el entorno activado:

```bash
pytest -v
```

Las pruebas usan **solo** la base `catalogo_test` (se vacía en cada prueba). Si por error apuntara a la misma base que `DATABASE_URL`, se detienen sin tocar nada.

Reglas de negocio cubiertas:
- No se pueden registrar dos productos con el mismo código (sin importar mayúsculas).
- Al editar, no se puede usar el código de otro producto.
- Precio mayor que 0; cantidad entera, no negativa y dentro del límite; campos obligatorios y no vacíos.
- La búsqueda encuentra por nombre o código.
- Un producto quitado deja de aparecer en el listado y en la consulta.
- Las categorías se listan sin repetir, ordenadas y solo de productos activos.

---

## Comprobaciones manuales

### Backend (desde http://localhost:8000/docs)

| # | Acción | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | Listar productos sin filtro | 200 con los 5 productos iniciales, ordenados por nombre | |
| 2 | Registrar producto válido con código en minúsculas | 201; el código se guarda en mayúsculas | |
| 3 | Registrar con un código que ya existe | 409 "Ya existe un producto con el código …" | |
| 4 | Registrar con precio 0, cantidad -3 y nombre vacío | 422 con los tres mensajes en español | |
| 5 | Registrar con precio de 3 decimales | 422 "El precio puede tener como máximo 2 decimales." | |
| 6 | Registrar con cantidad 3000000000 | 422 "La cantidad debe ser menor o igual a 2147483647." | |
| 7 | Buscar `pol` | Solo los productos que contienen "pol" en nombre o código | |
| 8 | Consultar id inexistente (999) | 404 "No se encontró el producto con id 999." | |
| 9 | Editar un producto usando el código de otro | 409 | |
| 10 | Quitar un producto | 200 "Se quitó «…» del catálogo." y ya no aparece en el listado | |
| 11 | Apagar PostgreSQL y listar | 503 "No se pudo conectar con la base de datos…" y la causa en el terminal | |
| 12 | `GET /categorias` | Lista sin repetir: `["Abrigo", "Camisas", "Pantalones", "Ropa de dormir"]` | |

### Frontend (desde http://localhost:5173)

| # | Acción | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | Abrir el catálogo | Bienvenida y 5 tarjetas con precio en soles | |
| 2 | Escribir `pol` en el buscador | Solo aparece Polera; "1 producto para «pol»" | |
| 3 | Buscar `xyz` | "No se encontró ningún producto con «xyz»." | |
| 4 | Nuevo producto → Registrar sin llenar nada | Los 5 campos en rojo con su mensaje; no se llama al backend | |
| 5 | Registrar un producto válido | Vuelve al catálogo con "Producto «…» registrado correctamente." | |
| 6 | Registrar otra vez el mismo código | "No se guardó: Ya existe un producto con el código …" y el campo código en rojo | |
| 7 | Editar un producto y guardar | Vuelve al catálogo con "Se guardaron los cambios…" y la tarjeta actualizada | |
| 8 | Eliminar → Cancelar en la confirmación | No cambia nada | |
| 9 | Eliminar → Aceptar | "Se quitó «…» del catálogo." y la tarjeta desaparece | |
| 10 | Apagar el backend y recargar | "No se pudo conectar con el servidor…" y botón Reintentar | |
| 11 | Nuevo producto → abrir la lista de Categoría | Las categorías registradas sin repetir y "+ Nueva categoría…" | |
| 12 | Registrar sin elegir categoría | "La categoría es obligatoria." | |
| 13 | Elegir "+ Nueva categoría…", escribir `Accesorios` y registrar | Se guarda y `Accesorios` aparece en la lista del siguiente registro | |
| 14 | Crear otra como nueva escribiendo `accesorios` | Se guarda como `Accesorios`; la lista no la duplica | |
| 15 | Editar un producto | Su categoría actual viene seleccionada y se puede cambiar | |

## Mejora propuesta: selector de categorías

**Problema:** al escribir la categoría a mano, la misma aparece de varias formas ("Abrigo", "abrigo", "Abrigos") y el catálogo pierde orden.

**Propuesta:** en el formulario, elegir la categoría de una lista con las ya registradas, con la opción de crear una nueva. Si la lista no carga, el campo vuelve a ser texto libre para no bloquear el registro.

**Estado:** desarrollada en la rama `mejora-categorias`, pendiente de aprobación antes de unirla a `main`.

## Pendientes

- Confirmar las decisiones marcadas como "Por confirmar".

## Tiempo efectivo aproximado

> *(Completar.)*

## Herramientas utilizadas

> *(Completar: documentación consultada, librerías, uso de IA y cómo se comprobó el resultado.)*
