import { useEffect, useState } from "react";
import axios from "axios";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";


export default function Movimiento() {
  const [rutas, setRutas] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [nuevaRuta, setNuevaRuta] = useState({
    nombre: "",
    fecha: "",
    municipios: [],
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    cargarRutas();
    axios.get("/api/municipios").then((res) => {
      console.log("📋 Municipios cargados:", res.data);
      setMunicipios(res.data || []);
    });
  }, []);

  const cargarRutas = () => {
    axios.get("/api/rutas").then((res) => setRutas(res.data || []));
  };

  const manejarCambio = (e) => {
    setNuevaRuta({ ...nuevaRuta, [e.target.name]: e.target.value });
  };

  const agregarMunicipio = (e) => {
    const value = e.target.value;
    if (!value) return;

    const id_mpio = Number(value);
    const municipio = municipios.find((m) => Number(m.id_mpio) === id_mpio);
    if (!municipio) return;

    const nombre = municipio.nombre;
    if (!nuevaRuta.municipios.some((m) => m.id_mpio === id_mpio)) {
      setNuevaRuta((prev) => ({
        ...prev,
        municipios: [...prev.municipios, { id_mpio, nombre }],
      }));
      setErrorMsg("");
    }

    e.target.value = "";
  };

  const eliminarMunicipioChip = (id_mpio) => {
    setNuevaRuta((prev) => ({
      ...prev,
      municipios: prev.municipios.filter((m) => m.id_mpio !== id_mpio),
    }));
  };

  const crearRuta = async (e) => {
    e.preventDefault();

    if (nuevaRuta.nombre.trim().length < 10) {
      setErrorMsg("⚠️ El nombre de la ruta debe tener al menos 10 caracteres.");
      return;
    }

    if (nuevaRuta.municipios.length < 2) {
      setErrorMsg("⚠️ Debes seleccionar al menos dos municipios para optimizar la ruta.");
      return;
    }

    setErrorMsg("");

    const dataEnviar = {
      ...nuevaRuta,
      municipios: nuevaRuta.municipios.map((m) => m.id_mpio),
    };

    const res = await axios.post("/api/rutas/optimizar", dataEnviar);
    setResultado(res.data);
    setMostrarModal(false);
    setNuevaRuta({ nombre: "", fecha: "", municipios: [] });
    cargarRutas();
  };

  const eliminarRuta = async (id) => {
    if (!window.confirm("¿Eliminar esta ruta?")) return;
    await axios.delete(`/api/rutas/${id}`);
    cargarRutas();
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toISOString().split("T")[0]; // solo YYYY-MM-DD
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🚚 <span>Rutas de Entrega</span>
        </h1>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          + Crear nueva ruta
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-green-50 border border-green-300 text-green-800 rounded-md p-3 mb-6">
          ✅ Ruta optimizada creada:{" "}
          <strong>{resultado.orden.join(" → ")}</strong> ({resultado.distanciaTotal} km)
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto shadow-lg rounded-xl bg-white border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-900 to-slate-900 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Fecha
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Nombre de ruta
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {rutas.length > 0 ? (
              rutas.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-gray-700">{formatoFecha(r.fecha)}</td>
                  <td className="py-3 px-6 text-gray-800 font-medium">{r.nombre}</td>
                  <td className="py-3 px-6 text-center flex justify-center gap-4">
                  <button
                    title="Ver en mapa"
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <MapPinIcon className="h-5 w-5" />
                  </button>
                  <button
                    title="Editar ruta"
                    className="text-yellow-500 hover:text-yellow-700 transition"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    title="Eliminar ruta"
                    onClick={() => eliminarRuta(r.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="py-6 text-center text-gray-500 italic bg-gray-100"
                >
                  No hay rutas creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={crearRuta}
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Crear nueva ruta
            </h2>

            {/* Campos principales (30%-60%) */}
            <div className="flex gap-4 mb-6">
              <div className="w-[30%]">
                <label className="text-sm font-medium text-gray-600">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={nuevaRuta.fecha}
                  onChange={manejarCambio}
                  required
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">
                  Nombre (mín. 10 caracteres)
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej: Entrega zona norte AM"
                  value={nuevaRuta.nombre}
                  onChange={manejarCambio}
                  required
                  minLength={10}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Select + chips */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Municipios a entregar
              </label>

              <select
                onChange={agregarMunicipio}
                className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Selecciona municipio --</option>
                {municipios
                  .filter(
                    (m) =>
                      !nuevaRuta.municipios.some(
                        (sel) => sel.id_mpio === m.id_mpio
                      )
                  )
                  .map((m) => (
                    <option key={m.id_mpio} value={m.id_mpio}>
                      {m.nombre}
                    </option>
                  ))}
              </select>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {nuevaRuta.municipios.map((mun) => (
                  <span
                    key={mun.id_mpio}
                    className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow"
                  >
                    {mun.nombre}
                    <XMarkIcon
                      className="h-4 w-4 cursor-pointer hover:text-gray-200"
                      onClick={() => eliminarMunicipioChip(mun.id_mpio)}
                    />
                  </span>
                ))}
              </div>

              {/* Alerta */}
              {errorMsg && (
                <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-800 text-sm mt-3 p-2 rounded-md">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarModal(false);
                  setErrorMsg("");
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
              >
                Optimizar y guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
