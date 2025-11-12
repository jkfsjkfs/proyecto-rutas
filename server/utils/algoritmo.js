import { pool } from "../db.js";

/**
 * Calcula la ruta óptima entre origen, destino e intermedios
 * usando Dijkstra (para distancias mínimas entre nodos)
 * y búsqueda exhaustiva (TSP exacto) para encontrar la ruta más corta global.
 */
export async function optimizarRuta(origen_id, destino_id, intermedios = []) {
  console.log("🚀 Iniciando optimización exacta de ruta");
  console.log("📍 Origen:", origen_id, "→ Destino:", destino_id, "Intermedios:", intermedios);

  // 1️⃣ Obtener todas las distancias desde la BD
  const [rows] = await pool.query(
    "SELECT id_origen, id_destino, distancia_km FROM distancias"
  );

  // 2️⃣ Construir grafo simétrico
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

  // 3️⃣ Definir todos los puntos a visitar
  const puntos = [String(origen_id), ...intermedios.map(String), String(destino_id)];

  // 4️⃣ Calcular matriz de distancias mínimas entre cada par (usando Dijkstra)
  const matriz = {};
  for (const origen of puntos) {
    const distancias = dijkstra(grafo, origen);
    for (const destino of puntos) {
      if (origen !== destino) {
        matriz[`${origen}-${destino}`] = distancias[destino] ?? Infinity;
      }
    }
  }

  // 5️⃣ Buscar ruta óptima exacta (todas las permutaciones posibles)
  const mejorRuta = tspExacto(puntos, matriz);

  // 6️⃣ Calcular distancia total
  let distanciaTotal = 0;
  for (let i = 0; i < mejorRuta.length - 1; i++) {
    distanciaTotal += matriz[`${mejorRuta[i]}-${mejorRuta[i + 1]}`] ?? 0;
  }

  console.log("🧭 Ruta óptima:", mejorRuta.join(" → "));
  console.log("📏 Distancia total:", distanciaTotal.toFixed(2), "km");

  // 7️⃣ Retornar resultado
  return {
    orden: mejorRuta.map(Number),
    distanciaTotal: Number(distanciaTotal.toFixed(2)),
  };
}

/**
 * Algoritmo de Dijkstra: obtiene las distancias mínimas desde un nodo origen a todos los demás.
 */
function dijkstra(grafo, inicio) {
  const dist = {};
  const visitado = new Set();
  const nodos = Object.keys(grafo);
  const inicioStr = String(inicio);

  for (const n of nodos) dist[n] = Infinity;
  dist[inicioStr] = 0;

  while (visitado.size < nodos.length) {
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
 * TSP exacto: evalúa todas las permutaciones posibles de los intermedios
 * para garantizar la ruta total más corta (origen → intermedios → destino).
 */
function tspExacto(puntos, matriz) {
  const origen = puntos[0];
  const destino = puntos[puntos.length - 1];
  const intermedios = puntos.slice(1, -1);

  // Generar todas las permutaciones posibles de los intermedios
  const permutar = (arr) =>
    arr.length <= 1
      ? [arr]
      : arr.flatMap((v, i) =>
          permutar([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [v, ...p])
        );

  const permutaciones = permutar(intermedios);

  let mejorRuta = null;
  let menorDistancia = Infinity;

  for (const perm of permutaciones) {
    const ruta = [origen, ...perm, destino];
    let distancia = 0;
    for (let i = 0; i < ruta.length - 1; i++) {
      distancia += matriz[`${ruta[i]}-${ruta[i + 1]}`] ?? Infinity;
    }
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      mejorRuta = ruta;
    }
  }

  return mejorRuta;
}
