import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { NOMBRE_EMPRESA } from "./config.js";
import Catalogo from "./pages/Catalogo/Catalogo.jsx";
import Eliminados from "./pages/Eliminados/Eliminados.jsx";
import FormularioProducto from "./pages/FormularioProducto/FormularioProducto.jsx";


export default function App() {
  return (
    <>
      <header className="encabezado">
        <div className="contenedor encabezado__contenido">
          <Link to="/" className="encabezado__marca">
            {NOMBRE_EMPRESA}
          </Link>
          <span className="encabezado__subtitulo">Catálogo de productos</span>

          <nav className="encabezado__nav" aria-label="Secciones">
            <NavLink to="/" end className="encabezado__enlace">
              Catálogo
            </NavLink>
            <NavLink to="/productos/eliminados" className="encabezado__enlace">
              Eliminados
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="contenedor contenido">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/productos/eliminados" element={<Eliminados />} />
          <Route path="/productos/nuevo" element={<FormularioProducto key="nuevo" />} />
          <Route path="/productos/:id/editar" element={<FormularioProducto key="editar" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
