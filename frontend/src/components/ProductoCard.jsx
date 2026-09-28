import { Link } from "react-router-dom";

// Muestra el precio como "S/ 59.90"
const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

/** Tarjeta de un producto con sus datos y las acciones Editar y Eliminar. */
export default function ProductoCard({ producto, onEliminar, eliminando }) {
  return (
    <article className="tarjeta">
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
          <dd>{producto.cantidad}</dd>
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
