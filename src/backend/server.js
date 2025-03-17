const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const port = 5000;

const JWT_SECRET = "1234";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 as test");
    res.json({ message: "Conexión a la base de datos exitosa", result: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al conectar a la base de datos", details: err.message });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
};

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

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada exitosamente." });
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acceso permitido", user: req.user });
});
// Endpoint para agregar un espacio de trabajo
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
// Endpoint para obtener los espacio de trabajo
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
// Endpoint para agregar una tarea.
app.post("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;
  const { title, description, dueDate, priority, status, assignedTo } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
  }
  if (!assignedTo || !assignedTo.trim()) {
    return res.status(400).json({ error: "Debe asignar un responsable." });
  }

  try {
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    const validPriority = ["baja", "media", "alta"].includes(priority?.toLowerCase())
      ? priority.toLowerCase()
      : "media";
    const validStatus = ["pendiente", "en progreso", "completada"].includes(status?.toLowerCase())
      ? status.toLowerCase()
      : "pendiente";

    const [assignedUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [assignedTo.trim()]
    );

    if (assignedUser.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
    }

    const assignedUserId = assignedUser[0].id;

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

// Endpoint GET para obtener tarea.
app.get("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;

  console.log("Procesando solicitud GET para workspaceId:", workspaceId, "userId:", userId);

  try {
    console.log("Verificando workspace...");
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      console.log("Workspace no encontrado o sin permisos para userId:", userId);
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    console.log("Workspace encontrado, obteniendo tareas...");
    const [tasks] = await db.query(
      `SELECT id_tarea AS id, id_espacio AS workspaceId, titulo AS title, descripcion AS description, 
       fecha_vencimiento AS dueDate, prioridad AS priority, estado AS status, fecha_creacion AS createdAt, assigned_to AS assignedTo 
       FROM Tareas WHERE id_espacio = ?`,
      [workspaceId]
    );

    console.log("Tareas obtenidas:", tasks);

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null, // Formatear fecha sin la hora
      priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : "Media",
      status: task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase() : "Pendiente",
      workspaceId: parseInt(task.workspaceId),
      createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
      assignedTo: task.assignedTo || null,
    }));

    console.log("Tareas formateadas:", formattedTasks);
    res.json({
      message: "Tareas obtenidas exitosamente.",
      tasks: formattedTasks,
    });
  } catch (err) {
    console.error("Error al obtener las tareas:", err.message, err.stack);
    res.status(500).json({ error: "Error al obtener las tareas.", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});