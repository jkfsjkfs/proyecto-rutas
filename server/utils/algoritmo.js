import { pool } from "../db.js";

/**
 * Calcula la ruta óptima entre origen, destino e intermedios usando
 * Dijkstra + heurística del Vecino Más Cercano.
 */
export async function optimizarRuta(origen_id, destino_id, intermedios = []) {
  console.log("🚀 Iniciando optimización de ruta");
  console.log("📍 Origen:", origen_id, "→ Destino:", destino_id, "Intermedios:", intermedios);

  // 1️⃣ Obtener todas las distancias desde la BD
  const [rows] = await pool.query(
    "SELECT id_origen, id_destino, distancia_km FROM distancias"
  );

  // 2️⃣ Construir grafo simétrico (todas las rutas posibles)
  const grafo = {};
  for (const d of rows) {
    const origen = String(d.id_origen);
    const destino = String(d.id_destino);
    const dist = Number(d.distancia_km);

    if (!grafo[origen]) grafo[origen] = {};
    if (!grafo[destino]) grafo[destino] = {};

    grafo[origen][destino] = dist;
    grafo[destino][origen] = dist;
  }

  console.log("🗺️ Grafo cargado con", Object.keys(grafo).length, "nodos.");

  // 3️⃣ Puntos a visitar (origen, intermedios, destino)
  const puntos = [origen_id, ...intermedios, destino_id].map(String);

  // 4️⃣ Calcular matriz de distancias mínimas entre cada punto (usando Dijkstra)
  const matriz = {};
  for (const origen of puntos) {
    const distancias = dijkstra(grafo, origen);
    for (const destino of puntos) {
      if (origen !== destino) {
        matriz[`${origen}-${destino}`] = distancias[destino] ?? Infinity;
      }
    }
  }

  // 5️⃣ Calcular orden óptimo (heurística del Vecino Más Cercano)
  const orden = tspVecinoMasCercano(puntos, matriz);

  // 6️⃣ Calcular distancia total
  let distanciaTotal = 0;
  for (let i = 0; i < orden.length - 1; i++) {
    distanciaTotal += matriz[`${orden[i]}-${orden[i + 1]}`] ?? 0;
  }

  console.log("🧭 Orden óptimo:", orden.join(" → "));
  console.log("📏 Distancia total:", distanciaTotal.toFixed(2), "km");

  // 7️⃣ Devolver resultados
  return {
    orden: orden.map(Number),
    distanciaTotal: Number(distanciaTotal.toFixed(2)),
  };
}

/**
 * Algoritmo de Dijkstra: calcula la distancia mínima desde un nodo de origen a todos los demás.
 */
function dijkstra(grafo, inicio) {
  const dist = {};
  const visitado = new Set();
  const nodos = Object.keys(grafo);
  const inicioStr = String(inicio);

  for (const n of nodos) dist[n] = Infinity;
  dist[inicioStr] = 0;

  while (visitado.size < nodos.length) {
    // nodo no visitado con menor distancia
    let actual = null;
    let menorDist = Infinity;
    for (const n of nodos) {
      if (!visitado.has(n) && dist[n] < menorDist) {
        menorDist = dist[n];
        actual = n;
      }
    }
    if (actual === null) break;

    visitado.add(actual);

    for (const vecino in grafo[actual]) {
      const nuevaDist = dist[actual] + grafo[actual][vecino];
      if (nuevaDist < dist[vecino]) {
        dist[vecino] = nuevaDist;
      }
    }
  }

  return dist;
}

/**
 * Heurística del Vecino Más Cercano para el problema del viajero (TSP simplificado)
 */
function tspVecinoMasCercano(puntos, matriz) {
  const visitados = new Set();
  const ruta = [puntos[0]]; // inicia en el origen
  let actual = puntos[0];
  visitados.add(actual);

  while (visitados.size < puntos.length) {
    let siguiente = null;
    let menorDist = Infinity;
    for (const p of puntos) {
      if (visitados.has(p)) continue;
      const d = matriz[`${actual}-${p}`] ?? Infinity;
      if (d < menorDist) {
        menorDist = d;
        siguiente = p;
      }
    }
    if (siguiente === null) break;
    ruta.push(siguiente);
    visitados.add(siguiente);
    actual = siguiente;
  }

  return ruta;
}
