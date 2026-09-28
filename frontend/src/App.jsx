import { Link, Navigate, Route, Routes } from "react-router-dom";
import { NOMBRE_EMPRESA } from "./config.js";
import Catalogo from "./pages/Catalogo/Catalogo.jsx";
import FormularioProducto from "./pages/FormularioProducto/FormularioProducto.jsx";

//Estructura de las rutas de la pagina aimunay
export default function App() {
  return (
    <>
      <header className="encabezado">
        <div className="contenedor encabezado__contenido">
          <Link to="/" className="encabezado__marca">
            {NOMBRE_EMPRESA}
          </Link>
          
        </div>
      </header>

      <main className="contenedor contenido">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          {/* "key" distinta: al pasar de editar a nuevo, el formulario empieza vacío */}
          <Route path="/productos/nuevo" element={<FormularioProducto key="nuevo" />} />
          <Route path="/productos/:id/editar" element={<FormularioProducto key="editar" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
