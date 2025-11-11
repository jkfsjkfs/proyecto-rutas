import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /api/municipios
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM municipios");
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo municipios:", err);
    res.status(500).json({ error: "Error obteniendo municipios" });
  }
});

// GET /api/municipios/distancias
router.get("/distancias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM distancias");
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo distancias:", err);
    res.status(500).json({ error: "Error obteniendo distancias" });
  }
});

export default router;
