import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { eliminarProducto, listarProductos } from "../../api/productos.js";
import Aviso from "../../components/Aviso.jsx";
import Buscador from "../../components/Buscador.jsx";
import { SkeletonTarjetas } from "../../components/Skeleton.jsx";
import ProductoCard from "../../components/ProductoCard.jsx";

/**
 * Página principal: bienvenida, buscador y tarjetas de productos.
 * Desde aquí se va a registrar o editar, y se eliminan productos.
 */
export default function Catalogo() {
  const location = useLocation();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recargas, setRecargas] = useState(0); // al cambiar, se vuelve a pedir la lista
  const [idEliminando, setIdEliminando] = useState(null);
  // Mensaje que puede llegar desde el formulario ("Producto registrado...")
  const [aviso, setAviso] = useState(location.state?.aviso ?? null);

  const cerrarAviso = useCallback(() => setAviso(null), []);

  function buscar(valor) {
    setBusqueda(valor);
    setCargando(true);
  }

  function recargar() {
    setRecargas((n) => n + 1);
    setCargando(true);
  }

  // Borra el mensaje del historial para que no reaparezca al recargar la página
  useEffect(() => {
    if (location.state?.aviso) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Pide los productos al backend. Al escribir en el buscador espera 300 ms
  // después de la última tecla, para no hacer una petición por cada letra.
  useEffect(() => {
    let vigente = true; // evita mostrar una respuesta vieja si llega tarde

    const temporizador = setTimeout(
      async () => {
        try {
          const datos = await listarProductos(busqueda);
          if (vigente) {
            setProductos(datos);
            setErrorCarga(false);
          }
        } catch (error) {
          if (vigente) {
            setProductos([]);
            setErrorCarga(true);
            setAviso({ tipo: "error", texto: error.message });
          }
        } finally {
          if (vigente) setCargando(false);
        }
      },
      busqueda ? 300 : 0
    );

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [busqueda, recargas]);

  async function eliminar(producto) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar «${producto.nombre}» (${producto.codigo}) del catálogo?`
    );
    if (!confirmado) return;

    setIdEliminando(producto.id);
    try {
      const respuesta = await eliminarProducto(producto.id);
      setAviso({ tipo: "exito", texto: respuesta.mensaje });
      recargar();
    } catch (error) {
      setAviso({ tipo: "error", texto: `No se pudo eliminar: ${error.message}` });
    } finally {
      setIdEliminando(null);
    }
  }

  const texto = busqueda.trim();
  const conteo = `${productos.length} producto${productos.length === 1 ? "" : "s"}`;

  return (
    <section>
      <div className="catalogo__intro">
        <div>
          <h1>¡Bienvenido!</h1>
          <p className="texto-suave">Registra, busca, edita y elimina los productos del catálogo.</p>
        </div>
        <Link to="/productos/nuevo" className="boton boton--primario">
          + Nuevo producto
        </Link>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} texto={aviso.texto} onCerrar={cerrarAviso} />}

      <Buscador valor={busqueda} onCambiar={buscar} />

      <p className="catalogo__conteo texto-suave" aria-live="polite">
        {cargando ? "Cargando…" : errorCarga ? "" : texto ? `${conteo} para «${texto}»` : conteo}
      </p>

      {cargando && productos.length === 0 ? (
        // Primera carga (o reintento): tarjetas de relleno mientras llegan los datos
        <SkeletonTarjetas />
      ) : productos.length === 0 ? (
        <div className="vacio">
          {errorCarga ? (
            <>
              <p>No se pudo cargar el catálogo.</p>
              <button
                type="button"
                className="boton boton--secundario"
                onClick={recargar}
              >
                Reintentar
              </button>
            </>
          ) : texto ? (
            <p>No se encontró ningún producto con «{texto}».</p>
          ) : (
            <p>Aún no hay productos. Registra el primero con «Nuevo producto».</p>
          )}
        </div>
      ) : (
        // Si ya hay tarjetas y se está buscando, se quedan atenuadas hasta que llegue la respuesta
        <div className={`grilla${cargando ? " grilla--actualizando" : ""}`} aria-busy={cargando}>
          {productos.map((producto, indice) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEliminar={eliminar}
              eliminando={idEliminando === producto.id}
              orden={indice}
            />
          ))}
        </div>
      )}
    </section>
  );
}
