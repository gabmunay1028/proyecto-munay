// El skeleton funciona como una pagina de carga visual cuando se refresca la pagina
export function Skeleton({ ancho = "100%", alto = 16, className = "" }) {
  return <span className={`skeleton ${className}`} style={{ width: ancho, height: alto }} />;
}

/** Tarjetas de producto de relleno para el catálogo. */
export function SkeletonTarjetas({ cantidad = 6 }) {
  return (
    <div className="grilla skeleton-contenedor" aria-hidden="true">
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
    <div className="skeleton-contenedor" aria-hidden="true">
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


export function SkeletonTabla({ filas = 5 }) {
  return (
    <div className="tabla-contenedor skeleton-contenedor" aria-hidden="true">
      {Array.from({ length: filas }, (_, indice) => (
        <div key={indice} className="skeleton-tabla__fila">
          <Skeleton ancho={70} alto={22} className="skeleton--pildora" />
          <Skeleton ancho="28%" />
          <Skeleton ancho="16%" />
          <Skeleton ancho="12%" />
          <Skeleton ancho="20%" />
        </div>
      ))}
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
