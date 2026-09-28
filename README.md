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
| Quitar un producto | Baja lógica: se marca `activo = FALSE` y deja de aparecer; no se borra de la base. Se pide confirmación en una ventana propia (Esc o un clic fuera cancelan) | Por confirmar |
| Código | Obligatorio, único, máx. 20 caracteres. Se guarda en mayúsculas (`pol-001` = `POL-001`) | Por confirmar |
| Código de un producto eliminado | Sigue ocupado; no se puede reutilizar. El aviso indica que se puede ver en «Productos eliminados» | Por confirmar |
| Productos eliminados | Página de solo consulta: los eliminados del más reciente al más antiguo, con la fecha en que se eliminaron y un buscador. Los eliminados antes de guardar la fecha figuran "Sin fecha". No permite restaurar | Pedido del supervisor (28/09) |
| Categoría | Se elige de una lista con las categorías registradas o se crea una nueva (máx. 50 caracteres). Si se escribe una que ya existe con otras mayúsculas (`abrigo`), se usa la registrada (`Abrigo`) | Aprobada por el supervisor |
| Precio | En soles (S/), mayor que 0, hasta 2 decimales, tipo `NUMERIC(10,2)` | Por confirmar |
| Cantidad | Número entero entre 0 y 2 147 483 647 (límite de `INTEGER`) | Por confirmar |
| Búsqueda | Por nombre **o** código, texto parcial, sin distinguir mayúsculas | Por confirmar |
| Filtro de stock | "Sin stock" = cantidad 0; "con stock" = cantidad mayor que 0. Opción "Todos" por defecto. Se combina con la búsqueda y se resuelve en el backend | Pedido del asesor (28/09) |
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
    │   │   ├── Iconos.jsx             # íconos SVG (flecha, papelera)
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
| GET | `/productos?buscar=texto&stock=todos\|con\|sin` | Lista los productos activos; filtra por nombre o código y por stock | 200 · 422 filtro inválido |
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
| `/` | Catálogo: bienvenida, buscador, filtro de stock, tarjetas con Editar y Eliminar |
| `/productos/nuevo` | Formulario para registrar un producto |
| `/productos/{id}/editar` | El mismo formulario, cargado con los datos del producto |
| `/productos/eliminados` | Tabla de productos eliminados con buscador (solo consulta) |

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
4. **Solo si tu base `catalogo` se creó antes de la página de eliminados**, ejecuta también `backend/sql/03_agregar_fecha_eliminacion.sql`. Agrega la columna con la fecha de eliminación; en una instalación nueva no hace falta, pero ejecutarlo no hace daño.

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
- El filtro de stock separa cantidad 0 de cantidad mayor que 0, se combina con la búsqueda y rechaza valores inválidos.
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

## Mejora propuesta: selector de categorías

**Problema:** al escribir la categoría a mano, la misma aparece de varias formas ("Abrigo", "abrigo", "Abrigos") y el catálogo pierde orden.

**Propuesta:** en el formulario, elegir la categoría de una lista con las ya registradas, con la opción de crear una nueva. Si la lista no carga, el campo vuelve a ser texto libre para no bloquear el registro.

**Estado:** propuesta y aprobada por el supervisor el 28/09/2026; incorporada en `main`.

## Ajustes solicitados durante la revisión

**Filtro de stock (asesor, 28/09):** ver solo los productos sin stock.
- Supuestos confirmados antes de programar: "sin stock" = cantidad 0, y se agregó la opción "Todos los productos" para poder volver a la lista completa.
- Ubicación: junto al buscador, porque ambos acotan la lista; "Nuevo producto" pasó a la misma barra y la bienvenida quedó centrada.
- Verificación: 4 pruebas automáticas nuevas en el backend (`test_filtro_stock.py`) y las comprobaciones manuales 13, 14 y 21 a 24.

**Productos eliminados (supervisor, 28/09):** que el usuario pueda ver qué productos se eliminaron, para no intentar crear uno que ya existió.
- Nombre: "Productos eliminados" y no "Historial", porque un historial haría esperar todos los cambios (ediciones, quién y cuándo); aquí solo se muestran los eliminados.
- Alcance: solo consulta, sin restaurar, como se pidió.
- Cambio en la base: nueva columna `eliminado_en` con la fecha de eliminación (script `03_agregar_fecha_eliminacion.sql` para bases existentes).
- Se enlaza desde el encabezado, desde la ventana de eliminar y desde el aviso de código ocupado.
- Verificación: 4 pruebas automáticas nuevas (`test_eliminados.py`) y las comprobaciones manuales 15, 16 y 25 a 29.

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
| 14 | Confirmar las decisiones marcadas "Por confirmar" | Encargo | Pendiente |
| 15 | Completar objetivo y alcance acordado | Encargo | Pendiente |
| 16 | Llenar "Resultado obtenido" en las comprobaciones manuales | Encargo | Pendiente |
| 17 | Completar tiempo efectivo y herramientas utilizadas (incluido el uso de IA) | Encargo | Pendiente |
| 18 | Clonar el repositorio en otra carpeta y levantarlo siguiendo solo este README | Encargo | Pendiente |
| 19 | Marcar la entrega base con `git tag entrega-base` | Encargo | Pendiente |
| 20 | Aplicar la regla de categorías también en el backend (hoy solo la aplica el formulario) | Propio | Pendiente (propuesta) |

**Posibles mejoras futuras (no incluidas, a conversar):** restaurar un producto eliminado, filtro por categoría y aviso de stock bajo.

## Tiempo efectivo aproximado

> *(Completar.)*

## Herramientas utilizadas

> *(Completar: documentación consultada, librerías, uso de IA y cómo se comprobó el resultado.)*
