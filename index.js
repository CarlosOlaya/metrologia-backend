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
        const ultimo = await collection
            .find()
            .sort({ fecha: -1 })
            .limit(1)
            .toArray();

        res.json(ultimo[0]);
    } catch (error) {
        console.error("Error obteniendo cronograma:", error);
        res.status(500).json({ error: "Error obteniendo cronograma" });
    }
});


app.post("/guardar-cronograma", async (req, res) => {
    try {
        const { tabla } = req.body;

        if (!Array.isArray(tabla)) {
            return res.status(400).json({ error: "El formato debe ser { tabla: [] }" });
        }

        await collection.insertOne({
            fecha: new Date(),
            tabla
        });

        res.json({ ok: true, mensaje: "✔ Nueva versión guardada correctamente" });

    } catch (error) {
        console.error("Error guardando:", error);
        res.status(500).json({ error: "Error guardando cronograma" });
    }
});


app.get("/cronograma/historial", async (req, res) => {
    try {
        const historial = await collection
            .find()
            .sort({ fecha: -1 })
            .toArray();

        res.json(historial);
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        res.status(500).json({ error: "Error obteniendo historial" });
    }
});

/* ======================================================
   🔹 3) INICIAR SERVIDOR
   ====================================================== */
app.listen(process.env.PORT, () => {
    console.log("🚀 Servidor corriendo en puerto " + process.env.PORT);
});
