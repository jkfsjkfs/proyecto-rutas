import { useEffect, useState } from "react";
import axios from "axios";

export default function Municipios() {
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    axios.get("/api/municipios")
      .then((res) => setMunicipios(res.data))
      .catch(() => setMunicipios([]));

  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📍 <span>Municipios registrados</span>
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-xl bg-white border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-900 to-slate-900 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Municipio
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wide">
                Subregión
              </th>
            </tr>
          </thead>

          <tbody>
            {municipios.length > 0 ? (
              municipios.map((m, i) => (
                <tr
                  key={i}
                  className={`border-b hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-gray-800 font-medium">{m.nombre}</td>
                  <td className="py-3 px-6 text-gray-700">{m.subregion || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="py-6 text-center text-gray-500 italic bg-gray-100"
                >
                  No hay municipios registrados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
