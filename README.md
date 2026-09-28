# Catálogo de productos — Prueba Full Stack Junior

AiMunay para registrar, buscar, actualizar y quitar productos del catálogo de una empresa comercial.

- **Backend:** Python + FastAPI 
- **Base de datos:** PostgreSQL
- **Frontend:** React + Vite + React Router

---

## Objetivo

Crear un sitio web que sirva como catalogo de productos para registrar, editar, eliminar y consultar funcionalidades para los productos
que pueda tener la tienda en su disponibilidad.

## Alcance acordado

Se realizo la aplicacion AiMunay como respuesta al documento pedido.

## Decisiones y supuestos

| Tema | Decisión actual | Estado |
|---|---|---|
| Quitar un producto | Baja lógica: se marca `activo = FALSE` y deja de aparecer; no se borra de la base. Se pide confirmación en una ventana propia (Esc o un clic fuera cancelan) | Por confirmar |
| Código | Obligatorio, único, máx. 20 caracteres. Se guarda en mayúsculas (`pol-001` = `POL-001`) | Por confirmar |
| Código de un producto eliminado | Sigue ocupado; no se puede reutilizar. El aviso indica que se puede ver en «Productos eliminados» | Por confirmar |
| Productos eliminados | Página de solo consulta: los eliminados del más reciente al más antiguo, con la fecha en que se eliminaron y un buscador. Los eliminados antes de guardar la fecha figuran "Sin fecha". No permite restaurar | Pedido del supervisor (28/09) |
| Categoría | Se elige de una lista con las categorías registradas o se crea una nueva (máx. 50 caracteres). Si se escribe una que ya existe con otras mayúsculas (`abrigo`), se usa la registrada (`Abrigo`) | Aprobada por el supervisor |
| Precio | En soles (S/), mayor que 0, hasta 2 decimales, tipo `NUMERIC(10,2)` | Por confirmar |
| Cantidad | Número entero entre 0 y 2 147 483 647 (límite de `INTEGER`) | Por confirmar |
| Búsqueda | Por nombre **o** código, texto parcial, sin distinguir mayúsculas | Por confirmar |
| Filtro de stock | "Sin stock" = cantidad 0; "con stock" = cantidad mayor que 0. Opción "Todos" por defecto. Se combina con la búsqueda y se resuelve en el backend | Pedido del asesor (28/09) |
| Orden | Nombre (A–Z) por defecto; también precio de menor a mayor y de mayor a menor. Si dos productos cuestan lo mismo, se ordenan por nombre. Se combina con la búsqueda y el filtro; "Ver todos los productos" limpia los filtros pero conserva el orden | Pedido del asesor (28/09) |
| Páginas | Tres: catálogo (bienvenida, buscador, filtro, eliminar), formulario (registrar y editar) y productos eliminados. Enlaces "Catálogo" y "Eliminados" en el encabezado | — |
| Textos | Se quitan los espacios al inicio y al final | — |
| Carga y animaciones | Esqueletos de carga en todas las páginas (solo aparecen si la carga pasa de 150 ms) y tarjetas que se elevan al pasar el mouse o el teclado. Se desactivan si el sistema pide reducir el movimiento | — |
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
│   │   ├── 02_datos_prueba.sql
│   │   └── 03_agregar_fecha_eliminacion.sql   # solo para bases creadas antes de esta columna
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_productos.py
│   │   ├── test_filtro_stock.py
│   │   ├── test_orden_precio.py
│   │   ├── test_eliminados.py
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
    │   │   ├── ConfirmarDialogo.jsx   # ventana de confirmación al eliminar
    │   │   ├── Buscador.jsx
    │   │   ├── Skeleton.jsx           # esqueletos de carga (tarjetas, formulario y tabla)
    │   │   ├── FiltroStock.jsx        # lista desplegable Todos / Con stock / Sin stock
    │   │   ├── Iconos.jsx             # íconos SVG (flecha, papelera, filtro, orden)
    │   │   ├── OrdenProductos.jsx     # lista desplegable Nombre / Precio menor-mayor / mayor-menor
    │   │   ├── ProductoCard.jsx       # tarjeta con Editar y Eliminar
    │   │   └── SelectorCategoria.jsx  # lista de categorías + opción nueva
    │   ├── pages/
    │   │   ├── Catalogo/
    │   │   │   └── Catalogo.jsx               # página principal
    │   │   ├── Eliminados/
    │   │   │   └── Eliminados.jsx             # productos eliminados (solo consulta)
    │   │   └── FormularioProducto/
    │   │       └── FormularioProducto.jsx     # registrar y editar
    │   ├── utils/
    │   │   ├── formato.js             # precio en soles y fechas
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
| GET | `/productos?buscar=texto&stock=todos\|con\|sin&orden=nombre\|precio_asc\|precio_desc` | Lista los productos activos; filtra por nombre o código y por stock, y los ordena | 200 · 422 filtro u orden inválido |
| GET | `/productos/eliminados?buscar=texto` | Productos eliminados, del más reciente al más antiguo, con su fecha de eliminación | 200 |
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
| `/` | Catálogo: bienvenida, buscador, filtro de stock, orden por precio, tarjetas con Editar y Eliminar |
| `/productos/nuevo` | Formulario para registrar un producto |
| `/productos/{id}/editar` | El mismo formulario, cargado con los datos del producto |
| `/productos/eliminados` | Tabla de productos eliminados con buscador (solo consulta) |

---

## Cómo ejecutarlo

**Requisitos:** Python 3.10 o superior, PostgreSQL 14 o superior (con la interfaz pgAdmin) y Node.js 20.19 o superior.

### 1. Preparar la base de datos

1. En pgAdmin crear dos bases de datos: **`catalogo`** y **`catalogo_test`**
   (clic derecho en *Databases* → *Create* → *Database…*).
2. Selecciona la base `catalogo`, abre la **Herramienta de consultas** (*Query Tool*) y ejecuta, en este orden:
   - `backend/sql/01_crear_tabla.sql`
   - `backend/sql/02_datos_prueba.sql` (carga 5 productos ficticios)
3. La base `catalogo_test` no necesita scripts ya las pruebas crean su tabla solas.
4. **Solo si la base `catalogo` se creó antes de la página de eliminados**, se ejecuta también `backend/sql/03_agregar_fecha_eliminacion.sql`. Agregar la columna con la fecha de eliminación; en una instalación nueva no hace falta, pero ejecutarlo no hace daño.

### 2. Levantar el backend (terminal powershell)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          
pip install -r requirements.txt
copy .env.example .env          
```

Abre `.env` y reemplaza `TU_CLAVE` por la contraseña del usuario de PostgreSQL. Luego:

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Documentación y pruebas manuales en fastapi: http://localhost:8000/docs

> Si PowerShell no deja activar el entorno, ejecuta una vez
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
> Si cambias el `.env`, reinicia `uvicorn` (Ctrl+C y de nuevo): `--reload` no vuelve a leer ese archivo.

### 3. Levantar el frontend (terminal 2)

```bash
cd frontend
npm install
copy .env.example .env          
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
- El filtro de stock separa cantidad 0 de cantidad mayor que 0, se combina con la búsqueda y rechaza valores inválidos.
- El orden por precio funciona en ambos sentidos, desempata por nombre, se combina con la búsqueda y el filtro, y rechaza valores inválidos.
- Al eliminar, el producto pasa a la lista de eliminados con su fecha; la lista se puede buscar, muestra primero el más reciente, y el aviso de código ocupado indica dónde verlo.

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
| 13 | Poner cantidad 0 a un producto; en `/docs` → `GET /productos` → Try it out → `stock` = `sin` → Execute | Solo aparecen los de cantidad 0 | |
| 14 | Listar con `stock=poco` | 422 "El filtro de stock no es una opción válida." | |
| 15 | Eliminar un producto y luego `GET /productos/eliminados` | Aparece con su fecha en `eliminado_en` | |
| 16 | Registrar con el código de un producto eliminado | 409 "… pertenece a un producto eliminado (…); puedes verlo en «Productos eliminados»…" | |
| 17 | En `/docs` → `GET /productos` → `orden` = `precio_asc` → Execute | Productos del más barato al más caro | |
| 18 | Listar con `orden=barato` | 422 "El orden no es una opción válida." | |

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
| 8 | Eliminar → Cancelar en la ventana (o Esc, o clic fuera) | La ventana se cierra y no cambia nada | |
| 9 | Eliminar → botón rojo "Eliminar" de la ventana | "Se quitó «…» del catálogo." y la tarjeta desaparece | |
| 10 | Apagar el backend y recargar | "No se pudo conectar con el servidor…" y botón Reintentar | |
| 11 | Nuevo producto → abrir la lista de Categoría | Las categorías registradas sin repetir y "+ Nueva categoría…" | |
| 12 | Registrar sin elegir categoría | "La categoría es obligatoria." | |
| 13 | Elegir "+ Nueva categoría…", escribir `Accesorios` y registrar | Se guarda y `Accesorios` aparece en la lista del siguiente registro | |
| 14 | Crear otra como nueva escribiendo `accesorios` | Se guarda como `Accesorios`; la lista no la duplica | |
| 15 | Editar un producto | Su categoría actual viene seleccionada y se puede cambiar | |
| 16 | F12 → Red → limitar a "3G lenta" y recargar el catálogo | Se ven tarjetas grises animadas y luego los productos | |
| 17 | Con la red lenta, abrir Nuevo y Editar | El título aparece al instante y el formulario como esqueleto hasta que cargan los datos | |
| 18 | Pasar el mouse sobre una tarjeta (o llegar con Tab) | La tarjeta se eleva con sombra y vuelve al salir | |
| 19 | Abrir la ventana de eliminar y pulsar Tab | El foco empieza en "Cancelar" y pasa a "Eliminar" | |
| 20 | En Nuevo o Editar, pulsar "Volver al catálogo" | Vuelve al catálogo (también con Tab + Enter) | |
| 21 | Editar un producto con cantidad 0 | Su tarjeta muestra "Sin stock" en rojo | |
| 22 | Filtro → "Productos sin stock" | Solo los de cantidad 0; "N productos sin stock"; el filtro se resalta en azul | |
| 23 | Filtro "con stock" + buscar `pol` | Se combinan: "1 producto con stock para «pol»" | |
| 24 | Filtro sin resultados → "Ver todos los productos" | Se limpian búsqueda y filtro y vuelven todos | |
| 25 | Eliminar un producto | La ventana avisa "Podrás verlo en «Productos eliminados»" | |
| 26 | Encabezado → "Eliminados" | Tabla con el producto, su categoría, precio y fecha; el enlace "Eliminados" queda resaltado | |
| 27 | Buscar en Eliminados | Solo los eliminados que coinciden; si no hay, "No se encontró ningún producto eliminado con «…»." | |
| 28 | Registrar un producto con el código de uno eliminado | El aviso indica que se puede ver en «Productos eliminados» | |
| 29 | Abrir Eliminados en el celular | Cada producto se ve como una ficha con sus títulos, sin desplazamiento horizontal | |
| 30 | Orden → "Precio: menor a mayor" y luego "mayor a menor" | Las tarjetas se reordenan por precio; la lista se resalta en azul | |
| 31 | Filtro "sin stock" + orden "mayor a menor" | Solo los de cantidad 0, del más caro al más barato | |
| 32 | Con un orden elegido, buscar algo sin resultados → "Ver todos los productos" | Vuelven todos y el orden elegido se mantiene | |

## Mejora propuesta: selector de categorías

**Problema:** al escribir la categoría a mano, la misma aparece de varias formas ("Abrigo", "abrigo", "Abrigos") y el catálogo pierde orden.

**Propuesta:** en el formulario, elegir la categoría de una lista con las ya registradas, con la opción de crear una nueva. Si la lista no carga, el campo vuelve a ser texto libre para no bloquear el registro.

**Estado:** propuesta y aprobada por el supervisor el 28/09/2026; incorporada en `main`.

## Ajustes solicitados durante la revisión

**Filtro de stock :** ver solo los productos sin stock.
- Supuestos confirmados antes de programar: "sin stock" = cantidad 0, y se agregó la opción "Todos los productos" para poder volver a la lista completa.
- Ubicación: junto al buscador, porque ambos acotan la lista; "Nuevo producto" pasó a la misma barra y la bienvenida quedó centrada.
- Verificación: 4 pruebas automáticas nuevas en el backend (`test_filtro_stock.py`) y las comprobaciones manuales 13, 14 y 21 a 24.

**Productos eliminados :** que el usuario pueda ver qué productos se eliminaron, para no intentar crear uno que ya existió.
- Nombre: "Productos eliminados" y no "Historial", porque un historial haría esperar todos los cambios (ediciones, quién y cuándo); aquí solo se muestran los eliminados.
- Alcance: solo consulta, sin restaurar, como se pidió.
- Cambio en la base: nueva columna `eliminado_en` con la fecha de eliminación (script `03_agregar_fecha_eliminacion.sql` para bases existentes).
- Se enlaza desde el encabezado, desde la ventana de eliminar y desde el aviso de código ocupado.
- Verificación: 4 pruebas automáticas nuevas (`test_eliminados.py`) y las comprobaciones manuales 15, 16 y 25 a 29.

**Orden por precio:** ordenar el catálogo por precio.
- Se implementó como una lista aparte del filtro de stock, porque ordenar no quita productos: así se pueden combinar (por ejemplo, "sin stock" del más caro al más barato).
- Opciones: Nombre (A–Z) por defecto, precio de menor a mayor y de mayor a menor; los empates se ordenan por nombre para que el resultado sea siempre el mismo.
- Se resuelve en el backend (`orden=precio_asc|precio_desc`), igual que la búsqueda y el filtro.
- Verificación: 5 pruebas automáticas nuevas (`test_orden_precio.py`) y las comprobaciones manuales 17, 18 y 30 a 32.

## Pendientes y avances

| # | Tarea | Origen | Estado |
|---|---|---|---|
| 1 | Backend: API de productos (listar, buscar, consultar, registrar, editar, eliminar) con validaciones y mensajes en español | Encargo | Realizado |
| 2 | Base de datos: tabla con restricciones y datos de prueba | Encargo | Realizado |
| 3 | Pruebas automatizadas de reglas de negocio (base aparte `catalogo_test`) | Encargo | Realizado |
| 4 | Frontend: catálogo, buscador y formulario para registrar y editar | Encargo | Realizado |
| 5 | Límite de cantidad para evitar un error 500 con números enormes | Encontrado al probar | Realizado |
| 6 | Mostrar en el terminal la causa de los errores de conexión con PostgreSQL | Encontrado al probar | Realizado |
| 7 | Selector de categorías registradas | Mejora propuesta, aprobada por el supervisor | Realizado |
| 8 | Logo de la empresa como ícono de la pestaña | Propio | Realizado |
| 9 | Esqueletos de carga y animaciones en las tarjetas | Propio | Realizado |
| 10 | Ventana de confirmación propia y botón "Volver al catálogo" | Propio | Realizado |
| 11 | Filtro de productos con y sin stock; bienvenida centrada | Asesor (28/09) | Realizado |
| 12 | Filtro de stock como lista desplegable en `/docs` | Propio | Realizado |
| 13 | Página de productos eliminados | Supervisor (28/09) | Realizado |
| 14 | Orden por precio (menor a mayor y mayor a menor) | Asesor (28/09) | Realizado |
| 15 | Confirmar las decisiones marcadas "Por confirmar" | Encargo | Pendiente |
| 16 | Completar objetivo y alcance acordado | Encargo | Pendiente |
| 17 | Llenar "Resultado obtenido" en las comprobaciones manuales | Encargo | Pendiente |
| 18 | Completar tiempo efectivo y herramientas utilizadas (incluido el uso de IA) | Encargo | Realizado |
| 19 | Clonar el repositorio en otra carpeta y levantarlo siguiendo solo este README | Encargo | Pendiente |
| 20 | Marcar la entrega base con `git tag entrega-base` | Encargo | Pendiente |
| 21 | Aplicar la regla de categorías también en el backend (hoy solo la aplica el formulario) | Propio | Pendiente (propuesta) |

**Posibles mejoras futuras (no incluidas, a conversar):** restaurar un producto eliminado, filtro por categoría y aviso de stock bajo.

## Tiempo efectivo aproximado

**≈ 5 h 30 min**, el 28/09/2026 (de 08:40 a 15:30, descontando la pausa del mediodía).

| Etapa | Tiempo aprox. |
|---|---|
| Lectura del encargo, preguntas y plan de arquitectura | 20 min |
| Backend, base de datos y pruebas automatizadas | 55 min |
| Entorno en Windows y bloqueos resueltos (activación del entorno virtual, `.env`, contraseña de PostgreSQL) | 35 min |
| Frontend: catálogo, buscador y formulario | 35 min |
| Repositorio Git y GitHub | 10 min |
| Mejoras de interfaz: selector de categorías, ícono, esqueletos, animaciones, ventana de confirmación | 55 min |
| Ajustes de la revisión: filtro de stock, productos eliminados, orden por precio | 1 h 10 min |
| Verificación manual y documentación | 50 min |

## Herramientas utilizadas

### Tecnologías
- **Backend:** Python 3.14, FastAPI, SQLAlchemy 2.1, Pydantic 2, psycopg 3, Uvicorn y python-dotenv.
- **Base de datos:** PostgreSQL 18 y pgAdmin 4.
- **Frontend:** React 19, Vite 8 y React Router 7; oxlint para revisar el código.
- **Pruebas:** pytest con el cliente de pruebas de FastAPI.
- **Entorno:** Visual Studio Code, PowerShell, Git Bash, Git y GitHub (repositorio privado).
- **Documentación de apoyo:** la documentación interactiva de la propia API (`/docs`).

### Uso de inteligencia artificial
Se usó **Claude**, asistente de IA como apoyo en el desarrollo:
- **Análisis:** revisar el encargo, identificar las preguntas para la reunión y proponer la arquitectura.
- **Código:** generar la primera versión del backend, el frontend, los scripts SQL y las pruebas automatizadas, y después cada ajuste pedido.
- **Diagnóstico:** interpretar los errores del entorno.
- **Documentación:**  README.

### Decisiones y trabajo propio:
- Elección de las tecnologías, la estructura de páginas y los datos de ejemplo.
- Consultas y acuerdos con el supervisor y el asesor: selector de categorías, filtro de stock, productos eliminados y orden por precio.
- Montaje y ejecución en el equipo local: entorno virtual, PostgreSQL y pgAdmin, scripts SQL, Git y GitHub.
- Revisión del código y pruebas manuales en la aplicación, en `/docs` y en pgAdmin.

### Cómo se comprobó el resultado
- **Pruebas automatizadas:** 24 pruebas con pytest sobre una base aparte (`catalogo_test`), ejecutadas con `pytest -v`.
- **Frontend:** `npm run lint` sin avisos y `npm run build` sin errores.
- **API:** llamadas desde `/docs` y revisión de los códigos de respuesta (200, 404, 409, 422, 503).
- **Base de datos:** consultas SQL en pgAdmin equivalentes a cada filtro y orden, comparadas con las respuestas de la API.
- **Interfaz:** las comprobaciones de la sección "Comprobaciones manuales", en escritorio y en vista de celular (F12).

El repositorio no incluye conversaciones privadas, contraseñas ni el archivo `.env`.
