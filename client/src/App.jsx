import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Municipios from "./pages/Municipios";
import Distancias from "./pages/Distancias";
import Movimiento from "./pages/Movimiento"; // ✅ Importación correcta

export default function App() {
  const [openConfig, setOpenConfig] = useState(true);
  const [openMov, setOpenMov] = useState(false);
  const location = useLocation();

  const linkClass = (path) =>
    `block px-4 py-2 rounded-md transition ${
      location.pathname === path
        ? "bg-white/20 font-semibold"
        : "hover:bg-white/10"
    }`;

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h1 className="text-xl font-bold tracking-wide">🌐 Proyecto Rutas</h1>
          <p className="text-sm text-blue-200">Optimización de recorridos</p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {/* ⚙️ Configuraciones */}
          <div className="mb-4">
            <button
              onClick={() => setOpenConfig(!openConfig)}
              className="w-full flex justify-between items-center px-2 py-2 font-semibold hover:bg-white/10 rounded-md"
            >
              <span>⚙️ Configuraciones</span>
              <span>{openConfig ? "▾" : "▸"}</span>
            </button>
            {openConfig && (
              <ul className="ml-3 mt-1 space-y-1 text-sm text-blue-100">
                <li>
                  <Link className={linkClass("/municipios")} to="/municipios">
                    🏙 Municipios
                  </Link>
                </li>
                <li>
                  <Link className={linkClass("/distancias")} to="/distancias">
                    📏 Distancias
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* 🚚 Movimiento */}
          <div>
            <button
              onClick={() => setOpenMov(!openMov)}
              className="w-full flex justify-between items-center px-2 py-2 font-semibold hover:bg-white/10 rounded-md"
            >
              <span>🚚 Movimiento</span>
              <span>{openMov ? "▾" : "▸"}</span>
            </button>
            {openMov && (
              <ul className="ml-3 mt-1 space-y-1 text-sm text-blue-100">
                <li>
                  <Link className={linkClass("/rutas")} to="/rutas">
                    🧭 Rutas
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* Pie del menú */}
        <div className="p-3 border-t border-white/20 text-xs text-blue-200">
          <p>© 2025 Análisis de Algoritmos · TdeA</p>
        </div>
      </aside>

      {/* --- Contenido principal --- */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <h1 className="text-3xl font-semibold text-gray-700">
                Bienvenido al sistema de rutas
              </h1>
            }
          />
          <Route path="/municipios" element={<Municipios />} />
          <Route path="/distancias" element={<Distancias />} />
          <Route path="/rutas" element={<Movimiento />} /> {/* ✅ nueva ruta */}
          <Route
            path="*"
            element={
              <h1 className="text-red-600 text-2xl">
                404 - Página no encontrada
              </h1>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
