import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

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
    id: String(m.id_mpio),
    name: m.nombre,
    color: "lightgray",
  }));

  // 🔹 Generar enlaces (aristas)
  const links = distancias.map((d) => ({
    source: String(d.id_origen),
    target: String(d.id_destino),
    distance: d.km,
    color: "#bbb",
  }));

  // 🔹 Resaltar ruta óptima
  if (ruta?.length > 1) {
    for (let i = 0; i < ruta.length - 1; i++) {
      const seg = links.find(
        (l) =>
          (l.source === String(ruta[i]) && l.target === String(ruta[i + 1])) ||
          (l.target === String(ruta[i]) && l.source === String(ruta[i + 1]))
      );
      if (seg) {
        seg.color = "#ff0000"; // rojo = ruta óptima
        seg.route = true; // marcar enlace de ruta
      }
    }
    ruta.forEach((id) => {
      const node = nodes.find((n) => n.id === String(id));
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
            cooldownTicks={100} // 🔄 permite que el layout se estabilice
            backgroundColor="#ffffff"
            // 🔹 Estilo de enlaces
            linkColor={(link) => link.color}
            linkWidth={(link) => (link.route ? 3.5 : 1.2)}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkDirectionalParticles={(link) => (link.route ? 2 : 0)} // animación solo en ruta
            linkDirectionalParticleSpeed={0.006}
            // 🔹 Dibuja nodos con etiquetas
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
              ctx.fillStyle = "#333";
              ctx.fillText(label, node.x, node.y - 12);
            }}
            // 🔹 Etiquetas de distancia sobre las aristas
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link, ctx) => {
              const start = link.source;
              const end = link.target;
              if (typeof start !== "object" || typeof end !== "object") return;

              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              ctx.save();
              ctx.font = "10px Sans-Serif";
              ctx.fillStyle = link.color === "#ff0000" ? "red" : "#666";
              ctx.textAlign = "center";
              ctx.fillText(`${link.distance} km`, midX, midY);
              ctx.restore();
            }}
          />
        </div>
      </div>
    </div>
  );
}
