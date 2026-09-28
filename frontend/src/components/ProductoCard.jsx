import { Link } from "react-router-dom";
import { formatoSoles } from "../utils/formato.js";

//Tarjeta de un producto con sus datos y las acciones Editar y Eliminar.


export default function ProductoCard({ producto, onEliminar, eliminando, orden = 0 }) {
  const clases = `tarjeta tarjeta--producto${eliminando ? " tarjeta--eliminando" : ""}`;
  return (
    <article className={clases} style={{ "--orden": orden }} aria-busy={eliminando}>
      <div className="tarjeta__cabecera">
        <h2 className="tarjeta__nombre">{producto.nombre}</h2>
        <span className="tarjeta__codigo">{producto.codigo}</span>
      </div>

      <dl className="tarjeta__datos">
        <div>
          <dt>Categoría</dt>
          <dd>{producto.categoria}</dd>
        </div>
        <div>
          <dt>Precio</dt>
          <dd>{formatoSoles.format(producto.precio)}</dd>
        </div>
        <div>
          <dt>Cantidad</dt>
          {producto.cantidad === 0 ? (
            <dd className="texto-sin-stock">Sin stock</dd>
          ) : (
            <dd>{producto.cantidad}</dd>
          )}
        </div>
      </dl>

      <div className="tarjeta__acciones">
        <Link to={`/productos/${producto.id}/editar`} className="boton boton--secundario">
          Editar
        </Link>
        <button
          type="button"
          className="boton boton--peligro"
          onClick={() => onEliminar(producto)}
          disabled={eliminando}
        >
          {eliminando ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </article>
  );
}
