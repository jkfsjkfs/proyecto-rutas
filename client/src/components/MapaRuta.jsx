import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import api from "../api"; // ✅ Cliente Axios centralizado

export default function MapaRuta({ municipios, distancias, ruta, distanciaTotal, onClose }) {
  const graphRef = useRef();
  const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });

  // 📏 Ajuste dinámico al tamaño del modal
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setSize({ width: clientWidth, height: clientHeight });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 🔹 Generar nodos base
  const nodes = municipios.map((m) => ({
    id: m.id_mpio,
    name: m.nombre,
    color: "lightgray",
  }));

  // 🔹 Generar enlaces (aristas)
  const links = distancias.map((d) => ({
    source: d.id_origen,
    target: d.id_destino,
    distance: d.km,
    color: "#bbb",
  }));

  // 🔹 Layout circular (ordenado visualmente)
  const radius = 300;
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    node.fx = radius * Math.cos(angle);
    node.fy = radius * Math.sin(angle);
  });

  // 🔹 Resaltar ruta óptima
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
      if (node) node.color = "#007bff"; // azul = nodo en la ruta
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90%] p-4 relative flex flex-col">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          ✕ Cerrar
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          🗺️ Mapa de la Ruta Óptima
        </h2>

        {/* Descripción de la ruta */}
        <div className="text-center mb-3 mt-2 bg-green-50 border border-green-300 text-green-900 rounded-md py-2 px-4 shadow">
          <span className="font-semibold">
            {ruta
              .map((id) => {
                const m = municipios.find((x) => x.id_mpio === id);
                return m ? m.nombre : `Mpio ${id}`;
              })
              .join(" → ")}
          </span>
          {distanciaTotal && (
            <span className="ml-2 text-green-800 font-medium">
              ({distanciaTotal} km)
            </span>
          )}
        </div>

        {/* 🗺️ Contenedor del grafo */}
        <div
          ref={containerRef}
          className="flex-1 w-full rounded-lg overflow-hidden border border-gray-200"
        >
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            graphData={{ nodes, links }}
            nodeLabel="name"
            cooldownTicks={0} // ❄️ Evita movimiento
            linkDirectionalParticles={0}
            linkWidth={(link) => (link.color === "#ff0000" ? 3 : 1.3)}
            linkColor={(link) => link.color}
            nodeCanvasObject={(node, ctx, globalScale) => {
              // 🔵 Dibuja nodos
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
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link, ctx) => {
              // 🔸 Dibuja texto de distancia
              const start = link.source;
              const end = link.target;
              if (typeof start !== "object" || typeof end !== "object") return;

              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              ctx.save();
              ctx.font = "10px Sans-Serif";
              ctx.fillStyle = link.color === "#ff0000" ? "red" : "#555";
              ctx.fillText(`${link.distance} km`, midX, midY);
              ctx.restore();
            }}
          />
        </div>
      </div>
    </div>
  );
}
