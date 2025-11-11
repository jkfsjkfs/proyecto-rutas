import express from "express";
import { pool } from "../db.js";
import { optimizarRuta } from "../utils/algoritmo.js";


const router = express.Router();

// 🔹 Listar todas las rutas guardadas
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, 
             mo.nombre AS origen_nombre,
             md.nombre AS destino_nombre
      FROM rutas r
      JOIN municipios mo ON r.origen_id = mo.id_mpio
      JOIN municipios md ON r.destino_id = md.id_mpio
      ORDER BY r.fecha DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al listar rutas:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Crear y optimizar una nueva ruta (considerando todo el grafo)
router.post("/", async (req, res) => {
  try {
    const { nombre, fecha, origen_id, destino_id, intermedios = [] } = req.body;

    if (!nombre || !fecha || !origen_id || !destino_id) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos (nombre, fecha, origen, destino)" });
    }

    // 🔹 Ejecutar algoritmo completo
    const { orden, distanciaTotal } = await optimizarRuta(
      origen_id,
      destino_id,
      intermedios
    );

    // 🔹 Guardar en base de datos (TEXT)
    const [result] = await pool.query(
      `INSERT INTO rutas (
        nombre, fecha, origen_id, destino_id, id_intermedios, orden_optimo, distancia_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        fecha,
        origen_id,
        destino_id,
        JSON.stringify(intermedios),
        JSON.stringify(orden),
        distanciaTotal,
      ]
    );

    res.json({
      id_ruta: result.insertId,
      nombre,
      fecha,
      origen_id,
      destino_id,
      intermedios,
      orden,
      distanciaTotal,
    });
  } catch (err) {
    console.error("❌ Error al crear ruta:", err);
    res.status(500).json({ error: "Error al optimizar la ruta" });
  }
});

// 🔹 Eliminar ruta
router.delete("/:id", async (req, res) => {
  try {
    const [r] = await pool.query("DELETE FROM rutas WHERE id_ruta = ?", [
      req.params.id,
    ]);
    res.json({ eliminado: r.affectedRows > 0 });
  } catch (err) {
    console.error("❌ Error eliminando ruta:", err);
    res.status(500).json({ error: "Error al eliminar la ruta" });
  }
});




router.put("/:id", async (req, res) => {
  try {
    const id_ruta = req.params.id;
    const { nombre, fecha, origen_id, destino_id, intermedios = [] } = req.body;

    if (!nombre || !fecha || !origen_id || !destino_id)
      return res.status(400).json({ error: "Faltan campos requeridos" });

    // 🔹 Recalcular optimización con nuevos datos
    const { orden, distanciaTotal } = await optimizarRuta(
      origen_id,
      destino_id,
      intermedios
    );

    // 🔹 Actualizar la base de datos
    await pool.query(
      `UPDATE rutas 
       SET nombre=?, fecha=?, origen_id=?, destino_id=?, 
           id_intermedios=?, orden_optimo=?, distancia_total=? 
       WHERE id_ruta=?`,
      [
        nombre,
        fecha,
        origen_id,
        destino_id,
        JSON.stringify(intermedios),
        JSON.stringify(orden),
        distanciaTotal,
        id_ruta,
      ]
    );

    res.json({
      id_ruta,
      nombre,
      fecha,
      orden,
      distanciaTotal,
      actualizado: true,
    });
  } catch (err) {
    console.error("❌ Error actualizando ruta:", err);
    res.status(500).json({ error: "Error al actualizar la ruta" });
  }
});


export default router;
