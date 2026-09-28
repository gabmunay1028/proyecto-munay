/**
 * Esqueletos de carga: bloques grises con brillo que ocupan el lugar del
 * contenido mientras llega del backend, para que la página no "salte".
 *
 * Solo se hacen visibles si la carga tarda más de 150 ms (ver .esqueleto-contenedor
 * en index.css); si todo es rápido, el usuario no ve un parpadeo.
 */

/** Un bloque gris animado. */
export function Skeleton({ ancho = "100%", alto = 16, className = "" }) {
  return <span className={`skeleton ${className}`} style={{ width: ancho, height: alto }} />;
}

/** Tarjetas de producto de relleno para el catálogo. */
export function SkeletonTarjetas({ cantidad = 6 }) {
  return (
    <div className="grilla esqueleto-contenedor" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, indice) => (
        <div key={indice} className="tarjeta">
          <div className="tarjeta__cabecera">
            <Skeleton ancho="55%" alto={22} />
            <Skeleton ancho={70} alto={22} className="skeleton--pildora" />
          </div>
          <div className="tarjeta__datos">
            {[0, 1, 2].map((fila) => (
              <div key={fila}>
                <Skeleton ancho="35%" />
                <Skeleton ancho="28%" />
              </div>
            ))}
          </div>
          <div className="tarjeta__acciones">
            <Skeleton alto={40} />
            <Skeleton alto={40} />
          </div>
        </div>
      ))}
    </div>
  );
}


export function  SkeletonFormulario() {
  return (
    <div className="esqueleto-contenedor" aria-hidden="true">
      <div className="formulario">
        <CampoSkeleton />
        <CampoSkeleton  />
        <CampoSkeleton />
        <div className="formulario__fila">
          <CampoSkeleton />
          <CampoSkeleton  />
        </div>
        <div className="formulario__acciones">
          <Skeleton ancho={100} alto={40} />
          <Skeleton ancho={170} alto={40} />
        </div>
      </div>
    </div>
  );
}

function CampoSkeleton() {
  return (
    <div className="campo">
      <Skeleton ancho={90} alto={18} />
      <Skeleton alto={42} />
    </div>
  );
}
