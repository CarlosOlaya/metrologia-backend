require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const client = new MongoClient(process.env.MONGO_URI);

let collection;

(async () => {
    try {
        await client.connect();
        const db = client.db("metrologiaDB");
        collection = db.collection("cronograma");
        console.log("✔ Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error conectando a Mongo:", error);
    }
})();

/* ======================================================
   🔹 1) CONSULTAR CRONOGRAMA COMPLETO
   ====================================================== */
app.get("/cronograma", async (req, res) => {
    try {
        const data = await collection.findOne({});
        res.json(data ?? { tabla: [] });
    } catch (error) {
        res.status(500).json({ error: "Error consultando cronograma" });
    }
});

/* ======================================================
   🔹 2) GUARDAR/ACTUALIZAR CRONOGRAMA COMPLETO
   ====================================================== */
app.post("/guardar-cronograma", async (req, res) => {
    try {
        const { tabla } = req.body;

        if (!Array.isArray(tabla)) {
            return res.status(400).json({ error: "El formato debe ser { tabla: [] }" });
        }

        await collection.updateOne(
            {},                 // siempre un solo documento
            { $set: { tabla }}, // reemplaza tabla
            { upsert: true }    // si no existe, lo crea
        );

        res.json({ ok: true, mensaje: "✔ Cronograma guardado correctamente" });
        
    } catch (error) {
        console.error("Error guardando:", error);
        res.status(500).json({ error: "Error guardando cronograma" });
    }
});

/* ======================================================
   🔹 3) INICIAR SERVIDOR
   ====================================================== */
app.listen(process.env.PORT, () => {
    console.log("🚀 Servidor corriendo en puerto " + process.env.PORT);
});
