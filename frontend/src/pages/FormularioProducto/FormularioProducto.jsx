import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { actualizarProducto, crearProducto, obtenerProducto } from "../../api/productos.js";
import Aviso from "../../components/Aviso.jsx";
import { validarProducto } from "../../utils/validaciones.js";

const FORMULARIO_VACIO = { codigo: "", nombre: "", categoria: "", precio: "", cantidad: "" };

/**
 * Formulario para registrar un producto nuevo (/productos/nuevo)
 * o editar uno existente (/productos/:id/editar).
 */
export default function FormularioProducto() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [datos, setDatos] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const cerrarAviso = useCallback(() => setAviso(null), []);

  // En modo edición, carga los datos actuales del producto
  useEffect(() => {
    if (!esEdicion) return;
    let vigente = true;

    obtenerProducto(id)
      .then((producto) => {
        if (!vigente) return;
        setDatos({
          codigo: producto.codigo,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: producto.precio.toFixed(2),
          cantidad: String(producto.cantidad),
        });
      })
      .catch((error) => {
        if (!vigente) return;
        setAviso({ tipo: "error", texto: error.message });
        if (error.estado === 404) setNoEncontrado(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id, esEdicion]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((anterior) => ({ ...anterior, [name]: value }));
    // Al corregir un campo, se quita su mensaje de error
    if (errores[name]) {
      setErrores(({ [name]: _quitado, ...resto }) => resto);
    }
  }

  async function guardar(evento) {
    evento.preventDefault();
    setAviso(null);

    // 1) Validación en el navegador: avisa rápido sin llamar al backend
    const erroresLocales = validarProducto(datos);
    setErrores(erroresLocales);
    if (Object.keys(erroresLocales).length > 0) {
      setAviso({ tipo: "error", texto: "No se guardó: revisa los campos marcados en rojo." });
      return;
    }

    const producto = {
      codigo: datos.codigo.trim(),
      nombre: datos.nombre.trim(),
      categoria: datos.categoria.trim(),
      precio: Number(datos.precio),
      cantidad: Number(datos.cantidad),
    };

    // 2) El backend valida de nuevo y aplica las reglas de negocio (código único)
    setGuardando(true);
    try {
      const guardado = esEdicion
        ? await actualizarProducto(id, producto)
        : await crearProducto(producto);

      const texto = esEdicion
        ? `Se guardaron los cambios de «${guardado.nombre}» (${guardado.codigo}).`
        : `Producto «${guardado.nombre}» (${guardado.codigo}) registrado correctamente.`;
      navigate("/", { state: { aviso: { tipo: "exito", texto } } });
    } catch (error) {
      // 409 = código repetido: se marca el campo código
      setErrores(error.estado === 409 ? { codigo: error.message } : error.errores);
      setAviso({ tipo: "error", texto: `No se guardó: ${error.message}` });
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="texto-suave">Cargando producto…</p>;
  }

  return (
    <section className="pagina-formulario">
      <Link to="/" className="enlace-volver">
        ← Volver al catálogo
      </Link>
      <h1>{esEdicion ? "Editar producto" : "Nuevo producto"}</h1>
      <p className="texto-suave">
        {esEdicion
          ? "Modifica los datos y guarda los cambios."
          : "Completa los datos para registrar el producto en el catálogo."}
      </p>

      {aviso && <Aviso tipo={aviso.tipo} texto={aviso.texto} onCerrar={cerrarAviso} />}

      {!noEncontrado && (
        <form className="formulario" onSubmit={guardar} noValidate>
          <Campo
            nombre="codigo"
            etiqueta="Código"
            ayuda="Ej.: POL-002. Se guarda en mayúsculas y no se puede repetir."
            valor={datos.codigo}
            error={errores.codigo}
            onChange={cambiar}
            maxLength={20}
            className="campo__codigo"
            autoFocus={!esEdicion}
          />
          <Campo
            nombre="nombre"
            etiqueta="Nombre"
            valor={datos.nombre}
            error={errores.nombre}
            onChange={cambiar}
            maxLength={100}
          />
          <Campo
            nombre="categoria"
            etiqueta="Categoría"
            ayuda="Ej.: Abrigo, Camisas, Pantalones."
            valor={datos.categoria}
            error={errores.categoria}
            onChange={cambiar}
            maxLength={50}
          />
          <div className="formulario__fila">
            <Campo
              nombre="precio"
              etiqueta="Precio (S/)"
              tipo="number"
              valor={datos.precio}
              error={errores.precio}
              onChange={cambiar}
              min="0.01"
              step="0.01"
              inputMode="decimal"
            />
            <Campo
              nombre="cantidad"
              etiqueta="Cantidad"
              tipo="number"
              valor={datos.cantidad}
              error={errores.cantidad}
              onChange={cambiar}
              min="0"
              step="1"
              inputMode="numeric"
            />
          </div>

          <div className="formulario__acciones">
            <Link to="/" className="boton boton--secundario">
              Cancelar
            </Link>
            <button type="submit" className="boton boton--primario" disabled={guardando}>
              {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Registrar producto"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/** Un campo del formulario con su etiqueta, ayuda y mensaje de error. */
function Campo({ nombre, etiqueta, tipo = "text", valor, error, ayuda, ...otros }) {
  const idMensaje = `${nombre}-mensaje`;
  return (
    <div className="campo">
      <label htmlFor={nombre}>{etiqueta}</label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        value={valor}
        aria-invalid={Boolean(error)}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        {...otros}
      />
      {error ? (
        <p id={idMensaje} className="campo__error">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={idMensaje} className="campo__ayuda">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}
