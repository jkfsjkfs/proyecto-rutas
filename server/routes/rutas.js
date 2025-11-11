import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🔹 Obtener todas las rutas guardadas
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rutas ORDER BY fecha DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Crear y optimizar una nueva ruta
router.post("/optimizar", async (req, res) => {
  try {
    const { nombre, fecha, municipios } = req.body;
    if (!municipios || municipios.length < 2) {
      return res.status(400).json({ error: "Se requieren al menos 2 municipios" });
    }

    // 🔹 Obtener todas las distancias necesarias
    const [rows] = await pool.query("SELECT * FROM distancias");

    // 🔹 Construir un mapa de distancias
    const distMap = {};
    rows.forEach(d => {
      const k = `${d.id_origen}-${d.id_destino}`;
      const k2 = `${d.id_destino}-${d.id_origen}`;
      distMap[k] = d.km;
      distMap[k2] = d.km; // simétrico
    });

    // 🔹 Algoritmo vecino más cercano
    const visitados = new Set();
    let actual = municipios[0];
    const orden = [actual];
    visitados.add(actual);

    while (visitados.size < municipios.length) {
      let masCercano = null;
      let minDist = Infinity;

      for (const candidato of municipios) {
        if (visitados.has(candidato)) continue;
        const clave = `${actual}-${candidato}`;
        const dist = distMap[clave] ?? Infinity;

        if (dist < minDist) {
          minDist = dist;
          masCercano = candidato;
        }
      }

      if (masCercano === null) break; // por si falta una distancia
      orden.push(masCercano);
      visitados.add(masCercano);
      actual = masCercano;
    }

    // 🔹 Calcular distancia total
    let total = 0;
    for (let i = 0; i < orden.length - 1; i++) {
      total += distMap[`${orden[i]}-${orden[i + 1]}`] ?? 0;
    }

    // 🔹 Guardar la ruta
    const [result] = await pool.query(
      "INSERT INTO rutas (nombre, fecha, secuencia) VALUES (?, ?, ?)",
      [nombre, fecha, JSON.stringify(orden)]
    );

    res.json({
      id: result.insertId,
      orden,
      distanciaTotal: total.toFixed(1),
    });
  } catch (err) {
    console.error("Error optimizando ruta:", err);
    res.status(500).json({ error: "Error al optimizar la ruta" });
  }
});

export default router;
