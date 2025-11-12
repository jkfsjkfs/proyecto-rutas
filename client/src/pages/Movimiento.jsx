import { useEffect, useState } from "react";
import api from "../api"; // ✅ Cliente Axios centralizado

import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import MapaRuta from "../components/MapaRuta"; // ✅ Nuevo componente

export default function Movimiento() {
  const [rutas, setRutas] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [distancias, setDistancias] = useState([]);
  const [editandoRuta, setEditandoRuta] = useState(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [nuevaRuta, setNuevaRuta] = useState({
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
    origen_id: "",
    destino_id: "",
    intermedios: [],
  });
  const [mostrarResultado, setMostrarResultado] = useState(false);



  // 🔹 Ocultar mensaje de éxito después de 4 segundos
// 🔹 Mostrar y ocultar el mensaje con efecto fade
useEffect(() => {
  if (resultado) {
    setMostrarResultado(true); // aparece
    const timer = setTimeout(() => {
      setMostrarResultado(false); // inicia desvanecimiento
      setTimeout(() => setResultado(null), 700); // lo retira del DOM tras la animación
    }, 4000);
    return () => clearTimeout(timer);
  }
}, [resultado]);


  // 🔹 Cargar datos iniciales
  useEffect(() => {
    cargarRutas();
    api.get("/municipios").then((res) => setMunicipios(res.data || []));
  }, []);

  // 🔹 Cargar distancias al abrir el mapa
  useEffect(() => {
    if (mostrarMapa) {
      api.get("/distancias").then((res) => setDistancias(res.data || []));
    }
  }, [mostrarMapa]);

  const cargarRutas = () => {
    api.get("/rutas").then((res) => setRutas(res.data || []));
  };

  const manejarCambio = (e) => {
    setNuevaRuta({ ...nuevaRuta, [e.target.name]: e.target.value });
  };

  const agregarIntermedio = (e) => {
    const value = e.target.value;
    if (!value) return;

    const id_mpio = Number(value);
    const municipio = municipios.find((m) => Number(m.id_mpio) === id_mpio);
    if (!municipio) return;

    if (nuevaRuta.intermedios.some((m) => m.id_mpio === id_mpio)) return;

    setNuevaRuta((prev) => ({
      ...prev,
      intermedios: [...prev.intermedios, { id_mpio, nombre: municipio.nombre }],
    }));
    e.target.value = "";
  };

  const eliminarIntermedio = (id_mpio) => {
    setNuevaRuta((prev) => ({
      ...prev,
      intermedios: prev.intermedios.filter((m) => m.id_mpio !== id_mpio),
    }));
  };

  const crearOActualizarRuta = async (e) => {
    e.preventDefault();
    try {
      if (nuevaRuta.nombre.trim().length < 10) {
        setErrorMsg("⚠️ El nombre de la ruta debe tener al menos 10 caracteres.");
        return;
      }
      if (!nuevaRuta.origen_id || !nuevaRuta.destino_id) {
        setErrorMsg("⚠️ Debes seleccionar origen y destino.");
        return;
      }

      const dataEnviar = {
        nombre: nuevaRuta.nombre,
        fecha: nuevaRuta.fecha,
        origen_id: Number(nuevaRuta.origen_id),
        destino_id: Number(nuevaRuta.destino_id),
        intermedios: nuevaRuta.intermedios.map((m) => m.id_mpio),
      };

      let res;
      if (editandoRuta) {
        res = await api.put(`/rutas/${editandoRuta.id_ruta}`, dataEnviar);
      } else {
        res = await api.post("/rutas", dataEnviar);
      }

      setResultado(res.data);
      setMostrarModal(false);
      setEditandoRuta(null);
      setNuevaRuta({
        nombre: "",
        fecha: new Date().toISOString().split("T")[0],
        origen_id: "",
        destino_id: "",
        intermedios: [],
      });
      cargarRutas();
    } catch (err) {
      console.error("❌ Error guardando ruta:", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || "Error al guardar la ruta.");
    }
  };

  const editarRuta = (ruta) => {
    
    setEditandoRuta(ruta);
    setNuevaRuta({
      nombre: ruta.nombre,
      fecha: ruta.fecha ? new Date(ruta.fecha).toISOString().split("T")[0] : "",
      origen_id: ruta.origen_id,
      destino_id: ruta.destino_id,
      intermedios: ruta.id_intermedios
        ? JSON.parse(ruta.id_intermedios).map((id) => {
            const m = municipios.find((x) => x.id_mpio === id);
            return { id_mpio: id, nombre: m?.nombre || `Mpio ${id}` };
          })
        : [],
    });
    setMostrarModal(true);
    
  };

  const eliminarRuta = async (id_ruta) => {
    if (!window.confirm("¿Eliminar esta ruta?")) return;
    await api.delete(`/rutas/${id_ruta}`);
    cargarRutas();
  };

  const formatoFecha = (fecha) =>
    fecha ? new Date(fecha).toISOString().split("T")[0] : "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🚚 <span>Rutas de Entrega</span>
        </h1>
        <button
          onClick={() => {
            setEditandoRuta(null);
            setNuevaRuta({
              nombre: "",
              fecha: new Date().toISOString().split("T")[0],
              origen_id: "",
              destino_id: "",
              intermedios: [],
            });
            setMostrarModal(true);
          }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          + Crear nueva ruta
        </button>
      </div>

{resultado && (
  <div
    className={`transition-all duration-700 ease-out transform ${
      mostrarResultado ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
    } bg-green-50 border border-green-300 text-green-800 rounded-md p-3 mb-6`}
  >
    ✅ {editandoRuta ? "Ruta reoptimizada:" : "Ruta creada:"}{" "}
    <strong>
      {resultado.orden
        .map((id) => {
          const m = municipios.find((x) => x.id_mpio === id);
          return m ? m.nombre : `Mpio ${id}`;
        })
        .join(" → ")}
    </strong>{" "}
    ({resultado.distanciaTotal} km)
  </div>
)}


      {/* Tabla */}
      <div className="overflow-x-auto shadow-lg rounded-xl bg-white border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-900 to-slate-900 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Fecha</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Nombre</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Origen</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Destino</th>
              <th className="py-3 px-6 text-center text-sm font-semibold uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rutas.length > 0 ? (
              rutas.map((r, i) => (
                <tr
                  key={r.id_ruta}
                  className={`border-b hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-gray-700">{formatoFecha(r.fecha)}</td>
                  <td className="py-3 px-6 text-gray-800 font-medium">{r.nombre}</td>
                  <td className="py-3 px-6 text-gray-600">{r.origen_nombre}</td>
                  <td className="py-3 px-6 text-gray-600">{r.destino_nombre}</td>
                  <td className="py-3 px-6 flex justify-center gap-4">
                    <button
                      title="Ver en mapa"
                      onClick={() => {
                        setRutaSeleccionada(r);
                        setMostrarMapa(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <MapPinIcon className="h-5 w-5" />
                    </button>
                    <button
                      title="Editar ruta"
                      onClick={() => editarRuta(r)}
                      className="text-yellow-500 hover:text-yellow-700 transition"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      title="Eliminar ruta"
                      onClick={() => eliminarRuta(r.id_ruta)}
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
                  colSpan="5"
                  className="py-6 text-center text-gray-500 italic bg-gray-100"
                >
                  No hay rutas creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de crear/editar */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={crearOActualizarRuta}
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editandoRuta ? "Editar ruta existente" : "Crear nueva ruta"}
            </h2>

            {/* Fecha + Nombre */}
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
                  value={nuevaRuta.nombre}
                  onChange={manejarCambio}
                  required
                  minLength={10}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Origen / Destino */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Municipio de Origen
                </label>
                <select
                  name="origen_id"
                  value={nuevaRuta.origen_id}
                  onChange={manejarCambio}
                  required
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Selecciona origen --</option>
                  {municipios.map((m) => (
                    <option key={m.id_mpio} value={m.id_mpio}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Municipio de Destino
                </label>
                <select
                  name="destino_id"
                  value={nuevaRuta.destino_id}
                  onChange={manejarCambio}
                  required
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Selecciona destino --</option>
                  {municipios.map((m) => (
                    <option key={m.id_mpio} value={m.id_mpio}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Intermedios */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Paradas intermedias (opcional)
              </label>
              <select
                onChange={agregarIntermedio}
                className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Selecciona municipio --</option>
                {municipios
                  .filter(
                    (m) =>
                      !nuevaRuta.intermedios.some(
                        (sel) => sel.id_mpio === m.id_mpio
                      ) &&
                      m.id_mpio !== Number(nuevaRuta.origen_id) &&
                      m.id_mpio !== Number(nuevaRuta.destino_id)
                  )
                  .map((m) => (
                    <option key={m.id_mpio} value={m.id_mpio}>
                      {m.nombre}
                    </option>
                  ))}
              </select>
        
        {editandoRuta && editandoRuta.orden_optimo && (
  <div className="flex flex-wrap gap-2 mt-3">
    
    <div className="bg-green-50 border border-green-300 text-green-900 rounded-md p-3 mb-4 text-sm">
      <span>🗺️<strong>Ruta actual:</strong></span>{" "}
      <div>
      <span className="font-semibold">
        {JSON.parse(editandoRuta.orden_optimo)
          .map((id) => {
            const m = municipios.find((x) => x.id_mpio === id);
            return m ? m.nombre : `Mpio ${id}`;
          })
          .join(" → ")}
      </span>
      {editandoRuta.distancia_total && (
        <> ({editandoRuta.distancia_total} km)</>
      )}
      </div>
    </div>
  </div>
)}




              <div className="flex flex-wrap gap-2 mt-3">
                {nuevaRuta.intermedios.map((mun) => (
                  <span
                    key={mun.id_mpio}
                    className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow"
                  >
                    {mun.nombre}
                    <XMarkIcon
                      className="h-4 w-4 cursor-pointer hover:text-gray-200"
                      onClick={() => eliminarIntermedio(mun.id_mpio)}
                    />
                  </span>
                ))}
              </div>

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
                  setEditandoRuta(null);
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
                {editandoRuta ? "Reoptimizar y guardar" : "Optimizar y guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🗺️ Modal del mapa */}
      {mostrarMapa && rutaSeleccionada && (
<MapaRuta
  municipios={municipios}
  distancias={distancias}
  ruta={JSON.parse(rutaSeleccionada.orden_optimo || "[]")}
  distanciaTotal={rutaSeleccionada.distancia_total}
  onClose={() => setMostrarMapa(false)}
/>

      )}
    </div>
  );
}
