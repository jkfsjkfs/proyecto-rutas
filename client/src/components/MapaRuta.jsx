import React, { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function MapaRuta({ municipios, distancias, ruta, onClose }) {
  const graphRef = useRef();

  // 🔹 Generar nodos y enlaces
  const nodes = municipios.map((m) => ({
    id: m.id_mpio,
    name: m.nombre,
    color: "lightgray",
  }));

  const links = distancias.map((d) => ({
    source: d.id_origen,
    target: d.id_destino,
    distance: d.km,
    color: "#ccc",
  }));

  // 🔹 Resaltar la ruta óptima
  if (ruta?.length > 1) {
    for (let i = 0; i < ruta.length - 1; i++) {
      const seg = links.find(
        (l) =>
          (l.source === ruta[i] && l.target === ruta[i + 1]) ||
          (l.target === ruta[i] && l.source === ruta[i + 1])
      );
      if (seg) seg.color = "#ff0000"; // rojo = ruta óptima
    }

    ruta.forEach((id) => {
      const node = nodes.find((n) => n.id === id);
      if (node) node.color = "#007bff"; // azul = nodo en ruta
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90%] p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          ✕ Cerrar
        </button>

        <h2 className="text-xl font-bold mb-3 text-gray-800">
          🗺️ Mapa de la Ruta Óptima
        </h2>

        <ForceGraph2D
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeLabel="name"
          nodeAutoColorBy="group"
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.01}
          linkColor={(link) => link.color}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y - 10);
          }}
        />
      </div>
    </div>
  );
}
