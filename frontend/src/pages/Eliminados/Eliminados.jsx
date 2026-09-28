import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listarEliminados } from "../../api/productos.js";
import Aviso from "../../components/Aviso.jsx";
import Buscador from "../../components/Buscador.jsx";
import { IconoVolver } from "../../components/Iconos.jsx";
import { SkeletonTabla } from "../../components/Skeleton.jsx";
import { formatearFecha, formatoSoles } from "../../utils/formato.js";

// Sirve para saber qué productos existieron antes de registrar uno nuevo:


export default function Eliminados() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recargas, setRecargas] = useState(0);
  const [aviso, setAviso] = useState(null);
  const esperarTeclas = useRef(false); 

  const cerrarAviso = useCallback(() => setAviso(null), []);

  function buscar(valor) {
    esperarTeclas.current = true;
    setBusqueda(valor);
    setCargando(true);
  }

  function recargar() {
    esperarTeclas.current = false;
    setRecargas((n) => n + 1);
    setCargando(true);
  }

  // Pide la lista al backend 
  useEffect(() => {
    let vigente = true;

    const temporizador = setTimeout(
      async () => {
        try {
          const datos = await listarEliminados(busqueda);
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
  }, [busqueda, recargas]);

  const texto = busqueda.trim();
  const plural = productos.length === 1 ? "" : "s";
  const conteo =
    `${productos.length} producto${plural} eliminado${plural}` + (texto ? ` para «${texto}»` : "");

  return (
    <section>
      <Link to="/" className="boton boton--secundario boton--volver">
        <IconoVolver />
        Volver al catálogo
      </Link>
      <h1>Productos eliminados</h1>
      <p className="texto-suave">
        Productos que se quitaron del catálogo. Revísalos antes de registrar uno nuevo: sus
        códigos siguen ocupados.
      </p>

      {aviso && <Aviso tipo={aviso.tipo} texto={aviso.texto} onCerrar={cerrarAviso} />}

      <div className="eliminados__buscador">
        <Buscador valor={busqueda} onCambiar={buscar} />
      </div>

      <p className="catalogo__conteo texto-suave" aria-live="polite">
        {cargando ? "Cargando…" : errorCarga ? "" : conteo}
      </p>

      {cargando && productos.length === 0 ? (
        <SkeletonTabla />
      ) : productos.length === 0 ? (
        <div className="vacio">
          {errorCarga ? (
            <>
              <p>No se pudo cargar la lista de productos eliminados.</p>
              <button type="button" className="boton boton--secundario" onClick={recargar}>
                Reintentar
              </button>
            </>
          ) : texto ? (
            <p>No se encontró ningún producto eliminado con «{texto}».</p>
          ) : (
            <p>No hay productos eliminados.</p>
          )}
        </div>
      ) : (
        <div
          className={`tabla-contenedor${cargando ? " grilla--actualizando" : ""}`}
          aria-busy={cargando}
        >
          <table className="tabla">
            <caption className="visualmente-oculto">
              Productos eliminados, del más reciente al más antiguo
            </caption>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col" className="tabla__numero">
                  Precio
                </th>
                <th scope="col">Eliminado el</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const fecha = formatearFecha(producto.eliminado_en);
                return (
                  <tr key={producto.id}>
                    <td data-etiqueta="Código">
                      <span className="tarjeta__codigo">{producto.codigo}</span>
                    </td>
                    <td data-etiqueta="Nombre" className="tabla__nombre">
                      {producto.nombre}
                    </td>
                    <td data-etiqueta="Categoría">{producto.categoria}</td>
                    <td data-etiqueta="Precio" className="tabla__numero">
                      {formatoSoles.format(producto.precio)}
                    </td>
                    <td data-etiqueta="Eliminado el">
                      {fecha ?? <span className="texto-suave">Sin fecha</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
