const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://alexdev2003:1193118830Alex@cluster0.uoser.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function conectarDB() {
  try {
    await client.connect();
    db = client.db("FlasCards");
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
  }
}

conectarDB();

// 🔹 Crear un mazo
app.post('/decks', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await db.collection('decks').insertOne({ name });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Obtener todos los mazos
app.get('/decks', async (req, res) => {
  try {
    const decks = await db.collection('decks').find({}).toArray();
    res.status(200).json(decks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Editar un mazo
app.put('/decks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await db.collection('decks').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name } }
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar un mazo
app.delete('/decks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('decks').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
