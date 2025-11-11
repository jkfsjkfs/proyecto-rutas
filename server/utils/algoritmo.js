import { pool } from "../db.js";

/**
 * Calcula la ruta óptima entre origen y destino,
 * pasando por los intermedios indicados, pero considerando
 * todo el grafo de municipios y distancias.
 * Devuelve el orden total de municipios y la distancia acumulada.
 */
export async function optimizarRuta(origen_id, destino_id, intermedios = []) {
  // 1️⃣ Obtener todas las distancias desde la BD
  const [rows] = await pool.query("SELECT id_origen, id_destino, distancia_km FROM distancias");

  // 2️⃣ Construir grafo simétrico
  const grafo = {};
  for (const d of rows) {
    if (!grafo[d.id_origen]) grafo[d.id_origen] = {};
    if (!grafo[d.id_destino]) grafo[d.id_destino] = {};
    grafo[d.id_origen][d.id_destino] = d.km;
    grafo[d.id_destino][d.id_origen] = d.km;
  }

  // 🔹 Puntos a visitar (incluye origen y destino)
  const puntos = [origen_id, ...intermedios, destino_id].map(Number);

  // 3️⃣ Calcular matriz de distancias mínimas entre cada punto
  const matriz = {};
  for (const origen of puntos) {
    const distancias = dijkstra(grafo, origen);
    for (const destino of puntos) {
      if (origen !== destino) {
        matriz[`${origen}-${destino}`] = distancias[destino] ?? Infinity;
      }
    }
  }

  // 4️⃣ Calcular orden óptimo (TSP simplificado)
  const orden = tspVecinoMasCercano(puntos, matriz);

  // 5️⃣ Calcular distancia total
  let distanciaTotal = 0;
  for (let i = 0; i < orden.length - 1; i++) {
    distanciaTotal += matriz[`${orden[i]}-${orden[i + 1]}`] ?? 0;
  }

  // 6️⃣ Devuelve los resultados
  return {
    orden,
    distanciaTotal: Number(distanciaTotal.toFixed(2)),
  };
}

/**
 * Dijkstra — calcula la distancia mínima desde un nodo de origen a todos los demás.
 * @param {Object} grafo - objeto con forma { origen: { destino: km } }
 * @param {number} inicio - nodo inicial
 * @returns {Object} distancias mínimas { id_mpio: km }
 */
function dijkstra(grafo, inicio) {
  const dist = {};
  const visitado = new Set();
  const nodos = Object.keys(grafo);

  for (const n of nodos) dist[n] = Infinity;
  dist[inicio] = 0;

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
 * Heurística del Vecino Más Cercano para resolver TSP.
 * Devuelve el orden de los puntos visitados.
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
