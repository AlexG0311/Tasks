const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const port = 5000;

// Clave secreta para JWT (en producción, usa un .env)
const JWT_SECRET = "1234";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Ajusta a "http://localhost:5178" si es necesario
    credentials: true,
  })
);

// Conexión a MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tareas",
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

// Endpoint de prueba
app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 as test");
    res.json({ message: "Conexión a la base de datos exitosa", result: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al conectar a la base de datos", details: err.message });
  }
});

// Middleware para verificar JWT desde la cookie
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
};

// Registrar un usuario
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
});

// Iniciar sesión
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.json({ message: "Login exitoso", user: { id: user[0].id, email: user[0].email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

// Cerrar sesión
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada exitosamente." });
});

// Ruta protegida de ejemplo
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acceso permitido", user: req.user });
});

// Agregar un espacio de trabajo (POST)
app.post("/api/workspaces", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre del espacio de trabajo es obligatorio." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO workspaces (name, created_by) VALUES (?, ?)",
      [name.trim(), createdBy]
    );

    res.status(201).json({
      message: "Espacio de trabajo creado exitosamente.",
      workspace: {
        id: result.insertId,
        name: name.trim(),
        created_by: createdBy,
      },
    });
  } catch (err) {
    console.error("Error al crear el espacio de trabajo:", err);
    res.status(500).json({ error: "Error al crear el espacio de trabajo." });
  }
});

// Obtener espacios de trabajo (GET)
app.get("/api/workspaces", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT id, name FROM workspaces WHERE created_by = ?",
      [userId]
    );

    res.json({
      message: "Espacios de trabajo obtenidos exitosamente.",
      workspaces: rows,
    });
  } catch (err) {
    console.error("Error al obtener los espacios de trabajo:", err);
    res.status(500).json({ error: "Error al obtener los espacios de trabajo." });
  }
});

// Agregar una tarea en un espacio de trabajo (POST)
app.post("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;
  const { title, description, dueDate, priority, status, assignedTo } = req.body;

  // Validar datos requeridos
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
  }
  if (!assignedTo || !assignedTo.trim()) {
    return res.status(400).json({ error: "Debe asignar un responsable." });
  }

  try {
    // Verificar que el workspace pertenezca al usuario
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    // Normalizar los valores de prioridad y estado para que coincidan con el ENUM
    const validPriority = ["baja", "media", "alta"].includes(priority?.toLowerCase())
      ? priority.toLowerCase()
      : "media";
    const validStatus = ["pendiente", "en progreso", "completada"].includes(status?.toLowerCase())
      ? status.toLowerCase()
      : "pendiente";

    // Buscar el ID del usuario por su email
    const [assignedUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [assignedTo.trim()]
    );

    if (assignedUser.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
    }

    const assignedUserId = assignedUser[0].id;

    // Crear la tarea con la asignación
    const [result] = await db.query(
      `INSERT INTO Tareas (id_espacio, titulo, descripcion, fecha_vencimiento, prioridad, estado, id_usuario_creador, assigned_to) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workspaceId,
        title.trim(),
        description || null,
        dueDate || null,
        validPriority,
        validStatus,
        userId,
        assignedUserId,
      ]
    );

    const taskId = result.insertId;

    // Crear objeto de respuesta con el formato esperado por el frontend
    const newTask = {
      id: taskId,
      title: title.trim(),
      description: description || null,
      dueDate: dueDate || null,
      priority: validPriority.charAt(0).toUpperCase() + validPriority.slice(1),
      status: validStatus.charAt(0).toUpperCase() + validStatus.slice(1),
      workspaceId: parseInt(workspaceId),
      createdAt: new Date().toISOString(),
      assignedTo: assignedUserId,
    };

    res.status(201).json({
      message: "Tarea creada exitosamente.",
      task: newTask,
    });
  } catch (err) {
    console.error("Error al crear la tarea:", err);
    res.status(500).json({ error: "Error al crear la tarea." });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});