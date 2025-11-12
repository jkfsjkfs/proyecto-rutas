import { useEffect, useState } from "react";
import api from "../api"; // ✅ Cliente Axios centralizado

export default function Distancias() {
  const [distancias, setDistancias] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    api.get("/municipios")
      .then((res) => setMunicipios(res.data))
      .catch(() => setMunicipios([]));

    api.get("/municipios/distancias")
      .then((res) => setDistancias(res.data))
      .catch(() => setDistancias([]));

  }, []);

  const getNombre = (id) => {
    if (!id) return "—";
    const m = municipios.find(
      (x) => Number(x.id_mpio) === Number(id)
    );
    return m ? m.nombre + '  (' + m.subregion + ')' : '-';
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📏 <span>Distancias entre municipios</span>
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-xl bg-white border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-900 to-slate-900 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Municipio A
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Municipio B
              </th>
              <th className="py-3 px-6 text-right text-sm font-semibold uppercase tracking-wide">
                Km
              </th>
            </tr>
          </thead>

          <tbody>
            {distancias.length > 0 ? (
              distancias.map((d, i) => (
                <tr
                  key={i}
                  className={`border-b hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-gray-800 font-medium">
                    {getNombre(d.id_origen)}
                  </td>
                  <td className="py-3 px-6 text-gray-800 font-medium">
                    {getNombre(d.id_destino)}
                  </td>

                  <td className="py-3 px-6 text-right text-blue-800 font-semibold">
                    {d.distancia_km} km
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="py-6 text-center text-gray-500 italic bg-gray-100"
                >
                  No hay distancias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
