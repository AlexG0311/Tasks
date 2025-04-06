
import { createPool } from "mysql2/promise";



export const db = createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tareas_",
});

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("¡Conexión a MySQL exitosa!");
    connection.release();
  } catch (err) {
    console.error("Error al conectar a MySQL:", err.message);
    process.exit(1);
  }
}

testConnection();