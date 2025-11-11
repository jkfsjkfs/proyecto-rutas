import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import municipiosRoutes from "./routes/municipios.js";
import rutasRoutes from "./routes/rutas.js";




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API
app.use("/api/municipios", municipiosRoutes);
app.use("/api/rutas", rutasRoutes);

// Static frontend (Vite build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});


