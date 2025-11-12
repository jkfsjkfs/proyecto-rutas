import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function MapaRuta({ municipios, distancias, ruta, distanciaTotal, onClose }) {
  const graphRef = useRef();
  const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });

  // 📏 Ajuste dinámico del tamaño del modal
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

  const ESCALA = 450;

  // ⚙️ Calcular centro
  const latitudes = [];
  const longitudes = [];

  municipios.forEach((m) => {
    if (m.latitud && m.longitud) {
      latitudes.push(Number(m.latitud));
      longitudes.push(Number(m.longitud));
    }
  });

  const latMax = Math.max(...latitudes);
  const latMin = Math.min(...latitudes);
  const lonMax = Math.max(...longitudes);
  const lonMin = Math.min(...longitudes);
  const centroLat = (latMax + latMin) / 2;
  const centroLon = (lonMax + lonMin) / 2;

  // 🔹 Crear nodos
  const nodes = municipios.map((m) => {
    const lat = Number(m.latitud) || 0;
    const lon = Number(m.longitud) || 0;
    const id = String(m.id_mpio);
    const colorBase = ruta?.includes(m.id_mpio) ? "#007bff" : "lightgray";
    return {
      id,
      name: m.nombre,
      color: colorBase,
      x: (lon - centroLon) * ESCALA,
      y: -(lat - centroLat) * ESCALA,
      vx: 0,
      vy: 0,
    };
  });

  // 🔹 Crear enlaces
  const links = distancias.map((d) => ({
    source: String(d.id_origen),
    target: String(d.id_destino),
    distance: d.km,
    color: "#bbb",
  }));

  // 🔹 Marcar ruta óptima
  if (ruta?.length > 1) {
    for (let i = 0; i < ruta.length - 1; i++) {
      const seg = links.find(
        (l) =>
          (l.source === String(ruta[i]) && l.target === String(ruta[i + 1])) ||
          (l.target === String(ruta[i]) && l.source === String(ruta[i + 1]))
      );
      if (seg) seg.color = "#ff0000";
    }
  }

  // 🧠 Redibujar
  useEffect(() => {
    if (graphRef.current) {
      const graph = graphRef.current;
      setTimeout(() => graph.d3ReheatSimulation(), 50);
    }
  }, [nodes, links]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90%] p-4 relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          ✕ Cerrar
        </button>

        <h2 className="text-xl font-bold mb-3 text-gray-800">
          🗺️ Mapa de la Ruta Óptima
        </h2>

        <div className="text-center mb-3 mt-2 bg-green-50 border border-green-300 text-green-900 rounded-md py-2 px-4 shadow">
          <span className="font-semibold">
            {ruta
              .map((id) => municipios.find((x) => x.id_mpio === id)?.nombre || `Mpio ${id}`)
              .join(" → ")}
          </span>
          {distanciaTotal && (
            <span className="ml-2 text-green-800 font-medium">
              ({distanciaTotal} km)
            </span>
          )}
        </div>

        <div ref={containerRef} className="flex-1 w-full rounded-lg overflow-hidden border border-gray-200">
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            graphData={{ nodes, links }}
            nodeLabel="name"
            backgroundColor="#ffffff"
            cooldownTicks={0}
            linkColor={(link) => link.color}
            linkWidth={(link) => (link.color === "#ff0000" ? 3.5 : 1.2)}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkDirectionalParticles={(link) => (link.color === "#ff0000" ? 2 : 0)}
            linkDirectionalParticleSpeed={0.006}
            
            // 🎯 Dibujo personalizado de nodos con numeración
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;

              // círculo
              ctx.beginPath();
              ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();

              // número en los azules (posición en la ruta)
              if (ruta?.includes(Number(node.id))) {
                const index = ruta.indexOf(Number(node.id)) + 1;
                ctx.fillStyle = "#fff";
                ctx.font = `${10 / globalScale}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(index, node.x, node.y);
              }

              // etiqueta del nombre
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#333";
              ctx.fillText(label, node.x, node.y - 14);
            }}

            // 🔹 Etiquetas en aristas
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
