const express = require("express");
const mysql = require("mysql2/promise"); 
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT =  process.env.PORT ?? 5000;

const JWT_SECRET = "1234";
 
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// One dark pro <------- teme
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
  const { title, description, dueDate, priority } = req.body;

  // Validar que el título esté presente
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
  }

  try {
    // Verificar que el espacio de trabajo exista y que el usuario tenga permisos
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    // Validar y establecer la prioridad (por defecto "media")
    const validPriority = ["baja", "media", "alta"].includes(priority?.toLowerCase())
      ? priority.toLowerCase()
      : "media";

    // Fijar el estado como "pendiente"
    const status = "pendiente";

    // Insertar la tarea en la base de datos sin assigned_to
    const [result] = await db.query(
      `INSERT INTO Tareas (id_espacio, titulo, descripcion, fecha_vencimiento, prioridad, estado, id_usuario_creador) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        workspaceId,
        title.trim(),
        description || null,
        dueDate || null,
        validPriority,
        status,
        userId,
      ]
    );

    const taskId = result.insertId;

    // Formatear la respuesta
    const newTask = {
      id: taskId,
      title: title.trim(),
      description: description || null,
      dueDate: dueDate || null,
      priority: validPriority.charAt(0).toUpperCase() + validPriority.slice(1),
      status: status.charAt(0).toUpperCase() + status.slice(1), // "Pendiente"
      workspaceId: parseInt(workspaceId),
      createdAt: new Date().toISOString(),
      assignedTo: null, // No se asigna un responsable
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
  try {
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    const [tasks] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.first_name AS assignedFirstName, u.last_name AS assignedLastName 
       FROM tareas t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id_espacio = ?`,
      [workspaceId]
    );

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
      priority: task.priority
        ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()
        : "Media",
      status: task.status
        ? task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase()
        : "Pendiente",
      workspaceId: parseInt(task.workspaceId),
      createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
      assignedTo: task.assignedTo || null,
      assignedFirstName: task.assignedFirstName || null,
      assignedLastName: task.assignedLastName || null,
    }));

    res.json({ tasks: formattedTasks });
  } catch (err) {
    console.error("Error al obtener las tareas:", err);
    res.status(500).json({ error: "Error al obtener las tareas.", details: err.message });
  }
});

// Endpoint DELETE para eliminar tareas
app.delete("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;
  const { taskIds } = req.body; // Array de IDs de tareas a eliminar

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ error: "Debe proporcionar al menos un ID de tarea." });
  }

  try {
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    // Convertimos taskIds a una lista de parámetros para la consulta
    const placeholders = taskIds.map(() => "?").join(",");
    const [result] = await db.query(
      `DELETE FROM Tareas WHERE id_tarea IN (${placeholders}) AND id_espacio = ?`,
      [...taskIds, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No se encontraron tareas para eliminar." });
    }

    res.json({
      message: "Tareas eliminadas exitosamente.",
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error al eliminar las tareas:", err);
    res.status(500).json({ error: "Error al eliminar las tareas.", details: err.message });
  }
});

// Endpoint PUT para actualizar una tarea
// Endpoint PUT para actualizar una tarea
app.put("/api/workspaces/:workspaceId/tasks/:taskId", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { title, description, dueDate, priority, status, assignedTo } = req.body; // Campos opcionales

  try {
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    const [existingTask] = await db.query(
      "SELECT id_tarea FROM Tareas WHERE id_tarea = ? AND id_espacio = ?",
      [taskId, workspaceId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    // Solo actualizamos los campos que se proporcionan en la solicitud
    const updateFields = {};
    if (title !== undefined) updateFields.titulo = title.trim();
    if (description !== undefined) updateFields.descripcion = description || null;
    if (dueDate !== undefined) updateFields.fecha_vencimiento = dueDate || null;
    if (priority !== undefined) {
      const validPriority = ["baja", "media", "alta"].includes(priority?.toLowerCase())
        ? priority.toLowerCase()
        : "media";
      updateFields.prioridad = validPriority;
    }

    // No requerimos assignedTo ni status, pero si se envían, los validamos
    if (assignedTo !== undefined) {
      const [assignedUser] = await db.query("SELECT id FROM users WHERE email = ?", [assignedTo.trim()]);
      if (assignedUser.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
      }
      updateFields.assigned_to = assignedUser[0].id;
    }
    if (status !== undefined) {
      const validStatus = ["pendiente", "en progreso", "completada"].includes(status?.toLowerCase())
        ? status.toLowerCase()
        : "pendiente";
      updateFields.estado = validStatus;
    }

    // Si no hay campos para actualizar, devolvemos un error
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar." });
    }

    // Construimos la consulta SQL dinámicamente
    const setClause = Object.keys(updateFields)
      .map((key) => `${key} = ?`)
      .join(", ");
    const query = `UPDATE Tareas SET ${setClause} WHERE id_tarea = ? AND id_espacio = ?`;
    const values = [...Object.values(updateFields), taskId, workspaceId];

    await db.query(query, values);

    const [updatedTask] = await db.query(
      `SELECT id_tarea AS id, id_espacio AS workspaceId, titulo AS title, descripcion AS description, 
       fecha_vencimiento AS dueDate, prioridad AS priority, estado AS status, fecha_creacion AS createdAt, assigned_to AS assignedTo 
       FROM Tareas WHERE id_tarea = ?`,
      [taskId]
    );

    const formattedTask = {
      id: updatedTask[0].id,
      title: updatedTask[0].title || "",
      description: updatedTask[0].description || "",
      dueDate: updatedTask[0].dueDate ? updatedTask[0].dueDate.toISOString().split("T")[0] : null,
      priority: updatedTask[0].priority
        ? updatedTask[0].priority.charAt(0).toUpperCase() + updatedTask[0].priority.slice(1).toLowerCase()
        : "Media",
      status: updatedTask[0].status
        ? updatedTask[0].status.charAt(0).toUpperCase() + updatedTask[0].status.slice(1).toLowerCase()
        : "Pendiente",
      workspaceId: parseInt(updatedTask[0].workspaceId),
      createdAt: updatedTask[0].createdAt ? updatedTask[0].createdAt.toISOString() : new Date().toISOString(),
      assignedTo: updatedTask[0].assignedTo || null,
    };

    res.json({
      message: "Tarea actualizada exitosamente.",
      task: formattedTask,
    });
  } catch (err) {
    console.error("Error al actualizar la tarea:", err);
    res.status(500).json({ error: "Error al actualizar la tarea.", details: err.message });
  }
});

app.put("/api/workspaces/:workspaceId/tasks/:taskId/assign", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { assignedTo } = req.body;

  try {
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    const [existingTask] = await db.query(
      "SELECT id_tarea FROM Tareas WHERE id_tarea = ? AND id_espacio = ?",
      [taskId, workspaceId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const [assignedUser] = await db.query("SELECT id FROM users WHERE email = ?", [assignedTo.trim()]);
    if (assignedUser.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
    }
    const userIdAssigned = assignedUser[0].id;

    const [result] = await db.query(
      `INSERT INTO asignaciones_tareas (id_tarea, id_usuario_asignado, fecha_asignacion) 
       VALUES (?, ?, NOW())`,
      [taskId, userIdAssigned]
    );

    const assignmentId = result.insertId;

    const [updatedTask] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.nombre AS assignedFirstName, u.apellido AS assignedLastName 
       FROM Tareas t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id_tarea = ?`,
      [taskId]
    );

    const formattedTask = {
      id: updatedTask[0].id,
      title: updatedTask[0].title || "",
      description: updatedTask[0].description || "",
      dueDate: updatedTask[0].dueDate ? updatedTask[0].dueDate.toISOString().split("T")[0] : null,
      priority: updatedTask[0].priority
        ? updatedTask[0].priority.charAt(0).toUpperCase() + updatedTask[0].priority.slice(1).toLowerCase()
        : "Media",
      status: updatedTask[0].status
        ? updatedTask[0].status.charAt(0).toUpperCase() + updatedTask[0].status.slice(1).toLowerCase()
        : "Pendiente",
      workspaceId: parseInt(updatedTask[0].workspaceId),
      createdAt: updatedTask[0].createdAt ? updatedTask[0].createdAt.toISOString() : new Date().toISOString(),
      assignedTo: updatedTask[0].assignedTo || null,
      assignedFirstName: updatedTask[0].assignedFirstName || null,
      assignedLastName: updatedTask[0].assignedLastName || null,
    };

    res.json({
      message: "Responsable asignado exitosamente.",
      task: formattedTask,
      assignmentId: assignmentId,
    });
  } catch (err) {
    console.error("Error al asignar el responsable:", err);
    res.status(500).json({ error: "Error al asignar el responsable.", details: err.message });
  }
});






app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});