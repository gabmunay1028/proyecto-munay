import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { eliminarProducto, listarProductos } from "../../api/productos.js";
import Aviso from "../../components/Aviso.jsx";
import Buscador from "../../components/Buscador.jsx";
import ConfirmarDialogo from "../../components/ConfirmarDialogo.jsx";
import { SkeletonTarjetas } from "../../components/Skeleton.jsx";
import FiltroStock from "../../components/FiltroStock.jsx";
import OrdenProductos from "../../components/OrdenProductos.jsx";
import ProductoCard from "../../components/ProductoCard.jsx";


const DESCRIPCION_STOCK = { con: " con stock", sin: " sin stock" };

// Página principal: bienvenida, barra de herramientas 

export default function Catalogo() {
  const location = useLocation();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [stock, setStock] = useState(""); 
  const [orden, setOrden] = useState("nombre"); 
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recargas, setRecargas] = useState(0); 
  const [idEliminando, setIdEliminando] = useState(null);
 
  const [porEliminar, setPorEliminar] = useState(null);
  
  const [aviso, setAviso] = useState(location.state?.aviso ?? null);
 
  const esperarTeclas = useRef(false);

  const cerrarAviso = useCallback(() => setAviso(null), []);
  const cancelarEliminacion = useCallback(() => setPorEliminar(null), []);

  function buscar(valor) {
    esperarTeclas.current = true;
    setBusqueda(valor);
    setCargando(true);
  }

  function filtrar(valor) {
    esperarTeclas.current = false; 
    setStock(valor);
    setCargando(true);
  }

  function ordenar(valor) {
    esperarTeclas.current = false; 
    setOrden(valor);
    setCargando(true);
  }

  // Quita búsqueda y filtro de stock; el orden elegido se mantiene
  function quitarFiltros() {
    esperarTeclas.current = false;
    setBusqueda("");
    setStock("");
    setCargando(true);
  }

  function recargar() {
    esperarTeclas.current = false;
    setRecargas((n) => n + 1);
    setCargando(true);
  }

  // Borra el mensaje del historial para que no reaparezca al recargar la página
  useEffect(() => {
    if (location.state?.aviso) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Pide los productos al backend
  useEffect(() => {
    let vigente = true; // evita mostrar una respuesta vieja si llega tarde

    const temporizador = setTimeout(
      async () => {
        try {
          const datos = await listarProductos(busqueda, stock, orden);
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
      esperarTeclas.current ? 300 : 0
    );

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [busqueda, stock, orden, recargas]);

  // Se llama al pulsar "Eliminar" en la ventana de confirmación
  async function confirmarEliminacion() {
    const producto = porEliminar;
    setPorEliminar(null); // cierra la ventana
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
  const filtroTexto = DESCRIPCION_STOCK[stock] ?? "";
  const hayFiltros = Boolean(texto || stock);
  // Ej.: "5 productos", "2 productos sin stock", "1 producto con stock para «pol»"
  const conteo =
    `${productos.length} producto${productos.length === 1 ? "" : "s"}${filtroTexto}` +
    (texto ? ` para «${texto}»` : "");

  return (
    <section>
      <div className="catalogo__intro">
        <h1>¡Bienvenido!</h1>
        <p className="texto-suave">Registra, busca, edita y elimina los productos del catálogo.</p>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} texto={aviso.texto} onCerrar={cerrarAviso} />}

      <div className="catalogo__herramientas">
        <Buscador valor={busqueda} onCambiar={buscar} />
        <FiltroStock valor={stock} onCambiar={filtrar} />
        <OrdenProductos valor={orden} onCambiar={ordenar} />
        <Link to="/productos/nuevo" className="boton boton--primario">
          + Nuevo producto
        </Link>
      </div>

      <p className="catalogo__conteo texto-suave" aria-live="polite">
        {cargando ? "Cargando…" : errorCarga ? "" : conteo}
      </p>

      {cargando && productos.length === 0 ? (
        // Primera carga (o reintento): tarjetas de relleno mientras llegan los datos
        <SkeletonTarjetas />
      ) : productos.length === 0 ? (
        <div className="vacio">
          {errorCarga ? (
            <>
              <p>No se pudo cargar el catálogo.</p>
              <button type="button" className="boton boton--secundario" onClick={recargar}>
                Reintentar
              </button>
            </>
          ) : hayFiltros ? (
            <>
              <p>
                {texto
                  ? `No se encontró ningún producto${filtroTexto} con «${texto}».`
                  : `No hay productos${filtroTexto}.`}
              </p>
              <button type="button" className="boton boton--secundario" onClick={quitarFiltros}>
                Ver todos los productos
              </button>
            </>
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
              onEliminar={setPorEliminar}
              eliminando={idEliminando === producto.id}
              orden={indice}
            />
          ))}
        </div>
      )}

      <ConfirmarDialogo
        abierto={porEliminar !== null}
        titulo="¿Eliminar este producto?"
        mensaje={
          porEliminar &&
          `«${porEliminar.nombre}» (${porEliminar.codigo}) dejará de aparecer en el catálogo. ` +
            "Podrás verlo en «Productos eliminados»."

        }
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />
    </section>
  );
}
