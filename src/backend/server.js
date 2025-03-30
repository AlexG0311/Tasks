const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT ?? 5000;
const JWT_SECRET = "1234";

// Configura el servidor HTTP
const server = createServer(app);

// Configura Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Ajusta según el puerto de tu frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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

// Configura Socket.IO para manejar conexiones
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Unirse a una sala para una tarea específica
  socket.on("join_task", (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`Cliente ${socket.id} se unió a la sala task_${taskId}`);
  });

  // Manejar desconexión
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Programar un cron job para ejecutarse cada día a las 8:00 AM
cron.schedule("* * * * *", async () => {
  console.log("Verificando tareas próximas a vencer...");

  try {
    const [tasks] = await db.query(
      `SELECT t.id_tarea, t.titulo, t.fecha_vencimiento, t.assigned_to
       FROM tareas t
       WHERE t.fecha_vencimiento IS NOT NULL
       AND t.fecha_vencimiento >= NOW()
       AND t.fecha_vencimiento <= DATE_ADD(NOW(), INTERVAL 2 DAY)
       AND t.estado != 'completada'`
    );

    for (const task of tasks) {
      if (task.assigned_to) {
        const [existingNotif] = await db.query(
          `SELECT id FROM notificaciones
           WHERE id_tarea = ? AND id_usuario = ? AND tipo = 'recordatorio'
           AND fecha_notificacion >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
          [task.id_tarea, task.assigned_to]
        );

        if (existingNotif.length === 0) {
          const message = `La tarea "${task.titulo}" está próxima a vencer el ${task.fecha_vencimiento.toISOString().split("T")[0]}.`;
          await db.query(
            "INSERT INTO notificaciones (id_usuario, id_tarea, mensaje, tipo, fecha_notificacion) VALUES (?, ?, ?, 'recordatorio', NOW())",
            [task.assigned_to, task.id_tarea, message]
          );
          console.log(`Notificación generada para la tarea ${task.id_tarea}`);
        }
      }
    }
  } catch (err) {
    console.error("Error en el cron job de recordatorios:", err);
  }
});

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


// Endpoint PUT para actualizar un espacio de trabajo
app.put("/api/workspaces/:id", authenticateToken, async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre del espacio de trabajo es obligatorio." });
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

    // Actualizar el nombre del espacio de trabajo
    await db.query(
      "UPDATE workspaces SET name = ? WHERE id = ?",
      [name.trim(), workspaceId]
    );

    res.json({
      message: "Espacio de trabajo actualizado exitosamente.",
      workspace: {
        id: parseInt(workspaceId),
        name: name.trim(),
      },
    });
  } catch (err) {
    console.error("Error al actualizar el espacio de trabajo:", err);
    res.status(500).json({ error: "Error al actualizar el espacio de trabajo." });
  }
});

// Endpoint DELETE para eliminar un espacio de trabajo
app.delete("/api/workspaces/:id", authenticateToken, async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar que el espacio de trabajo exista y que el usuario tenga permisos
    const [workspace] = await db.query(
      "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
      [workspaceId, userId]
    );

    if (workspace.length === 0) {
      return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
    }

    // Eliminar el espacio de trabajo
    await db.query("DELETE FROM workspaces WHERE id = ?", [workspaceId]);

    res.json({ message: "Espacio de trabajo eliminado exitosamente." });
  } catch (err) {
    console.error("Error al eliminar el espacio de trabajo:", err);
    res.status(500).json({ error: "Error al eliminar el espacio de trabajo." });
  }
});

app.post("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;
  const { title, description, dueDate, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
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
    const status = "pendiente";

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

    const newTask = {
      id: taskId,
      title: title.trim(),
      description: description || null,
      dueDate: dueDate || null,
      priority: validPriority.charAt(0).toUpperCase() + validPriority.slice(1),
      status: status.charAt(0).toUpperCase() + status.slice(1),
      workspaceId: parseInt(workspaceId),
      createdAt: new Date().toISOString(),
      assignedTo: null,
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

app.get("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;

  try {
    const [workspaceAccess] = await db.query(
      `SELECT w.id 
       FROM workspaces w 
       LEFT JOIN workspace_users wu ON w.id = wu.workspace_id 
       WHERE w.id = ? AND (w.created_by = ? OR wu.user_id = ?)`,
      [workspaceId, userId, userId]
    );

    if (workspaceAccess.length === 0) {
      return res.status(403).json({ error: "No tienes acceso a este espacio de trabajo." });
    }

    const [tasks] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.first_name AS assignedFirstName, u.last_name AS assignedLastName 
       FROM tareas t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id_espacio = ? AND (t.assigned_to = ? OR EXISTS (
         SELECT 1 FROM workspace_users wu WHERE wu.workspace_id = t.id_espacio AND wu.user_id = ?
       ) OR EXISTS (
         SELECT 1 FROM workspaces w WHERE w.id = t.id_espacio AND w.created_by = ?
       ))`,
      [workspaceId, userId, userId, userId]
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

app.delete("/api/workspaces/:workspaceId/tasks", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user.id;
  const { taskIds } = req.body;

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

app.put("/api/workspaces/:workspaceId/tasks/:taskId", authenticateToken, async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { title, description, dueDate, priority, status, assignedTo } = req.body;

  try {
    const [existingTask] = await db.query(
      `SELECT t.id_tarea, t.id_espacio, t.assigned_to, t.estado, t.titulo
       FROM Tareas t 
       WHERE t.id_tarea = ? AND t.id_espacio = ? AND (t.assigned_to = ? OR EXISTS (
         SELECT 1 FROM workspaces w WHERE w.id = t.id_espacio AND w.created_by = ?
       ) OR EXISTS (
         SELECT 1 FROM workspace_users wu WHERE wu.workspace_id = t.id_espacio AND wu.user_id = ?
       ))`,
      [taskId, workspaceId, userId, userId, userId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ 
        error: "Tarea no encontrada o no tienes permisos para editarla." 
      });
    }

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
    if (status !== undefined) {
      const validStatus = ["pendiente", "en progreso", "completada"].includes(status?.toLowerCase())
        ? status.toLowerCase()
        : "pendiente";
      updateFields.estado = validStatus;
    }
    if (assignedTo !== undefined) {
      const [assignedUser] = await db.query("SELECT id FROM users WHERE email = ?", [assignedTo.trim()]);
      if (assignedUser.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
      }
      updateFields.assigned_to = assignedUser[0].id;

      const [existingAssociation] = await db.query(
        "SELECT * FROM workspace_users WHERE workspace_id = ? AND user_id = ?",
        [workspaceId, assignedUser[0].id]
      );

      if (existingAssociation.length === 0) {
        await db.query(
          "INSERT INTO workspace_users (workspace_id, user_id, role) VALUES (?, ?, 'member')",
          [workspaceId, assignedUser[0].id]
        );
      }

      if (existingTask[0].assigned_to !== assignedUser[0].id) {
        await db.query(
          `INSERT INTO asignaciones_tareas (id_tarea, id_usuario_asignado, fecha_asignacion) 
           VALUES (?, ?, NOW())`,
          [taskId, assignedUser[0].id]
        );
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar." });
    }

    const setClause = Object.keys(updateFields)
      .map((key) => `${key} = ?`)
      .join(", ");
    const query = `UPDATE Tareas SET ${setClause} WHERE id_tarea = ? AND id_espacio = ?`;
    const values = [...Object.values(updateFields), taskId, workspaceId];

    await db.query(query, values);

    if (status !== undefined && status.toLowerCase() !== existingTask[0].estado) {
      const message = `El estado de la tarea "${existingTask[0].titulo}" cambió a "${status}".`;
      if (existingTask[0].assigned_to) {
        await db.query(
          "INSERT INTO notificaciones (id_usuario, id_tarea, mensaje, tipo, fecha_notificacion) VALUES (?, ?, ?, 'cambio_estado', NOW())",
          [existingTask[0].assigned_to, taskId, message]
        );
      }
    }

    const [updatedTask] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.first_name AS assignedFirstName, u.last_name AS assignedLastName 
       FROM tareas t 
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

    const [existingAssociation] = await db.query(
      "SELECT * FROM workspace_users WHERE workspace_id = ? AND user_id = ?",
      [workspaceId, userIdAssigned]
    );

    if (existingAssociation.length === 0) {
      await db.query(
        "INSERT INTO workspace_users (workspace_id, user_id, role) VALUES (?, ?, 'member')",
        [workspaceId, userIdAssigned]
      );
    }

    const [result] = await db.query(
      `INSERT INTO asignaciones_tareas (id_tarea, id_usuario_asignado, fecha_asignacion) 
       VALUES (?, ?, NOW())`,
      [taskId, userIdAssigned]
    );

    const assignmentId = result.insertId;

    const [updatedTask] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.first_name AS assignedFirstName, u.last_name AS assignedLastName 
       FROM tareas t 
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

app.get("/api/my-assigned-tasks", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [tasks] = await db.query(
      `SELECT t.id_tarea AS id, t.id_espacio AS workspaceId, t.titulo AS title, t.descripcion AS description, 
       t.fecha_vencimiento AS dueDate, t.prioridad AS priority, t.estado AS status, t.fecha_creacion AS createdAt, 
       t.assigned_to AS assignedTo, u.first_name AS assignedFirstName, u.last_name AS assignedLastName 
       FROM tareas t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.assigned_to = ?`,
      [userId]
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
    console.error("Error al obtener las tareas asignadas:", err);
    res.status(500).json({ error: "Error al obtener las tareas asignadas.", details: err.message });
  }
});

// Endpoint POST para agregar un comentario a una tarea
app.post("/api/tasks/:taskId/comments", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { text } = req.body;

  try {
    const [task] = await db.query("SELECT id_tarea FROM tareas WHERE id_tarea = ?", [taskId]);
    if (task.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const [result] = await db.query(
      "INSERT INTO comentarios (id_tarea, id_usuario, texto, fecha) VALUES (?, ?, ?, NOW())",
      [taskId, userId, text]
    );

    const [newComment] = await db.query(
      `SELECT c.id, c.texto AS text, c.fecha AS date, u.first_name AS user 
       FROM comentarios c 
       JOIN users u ON c.id_usuario = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    const formattedComment = {
      id: newComment[0].id,
      user: newComment[0].user,
      text: newComment[0].text,
      date: newComment[0].date.toISOString().split("T")[0],
    };

    // Emitir el nuevo comentario a todos los clientes en la sala de la tarea
    io.to(`task_${taskId}`).emit("new_comment", formattedComment);

    res.status(201).json({ message: "Comentario agregado.", comment: formattedComment });
  } catch (err) {
    console.error("Error al agregar comentario:", err);
    res.status(500).json({ error: "Error al agregar comentario.", details: err.message });
  }
});

// Endpoint GET para obtener los comentarios de una tarea
app.get("/api/tasks/:taskId/comments", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const [comments] = await db.query(
      `SELECT c.id, c.texto AS text, c.fecha AS date, u.first_name AS user 
       FROM comentarios c 
       JOIN users u ON c.id_usuario = u.id 
       WHERE c.id_tarea = ? 
       ORDER BY c.fecha ASC`,
      [taskId]
    );

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      user: comment.user,
      text: comment.text,
      date: comment.date.toISOString().split("T")[0],
    }));

    res.json({ comments: formattedComments });
  } catch (err) {
    console.error("Error al obtener comentarios:", err);
    res.status(500).json({ error: "Error al obtener comentarios.", details: err.message });
  }
});

app.get("/api/notifications", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [notifications] = await db.query(
      `SELECT n.id, n.id_tarea, n.mensaje, n.tipo, n.fecha_notificacion, n.leida, t.titulo AS tarea_titulo
       FROM notificaciones n
       JOIN tareas t ON n.id_tarea = t.id_tarea
       WHERE n.id_usuario = ?
       ORDER BY n.fecha_notificacion DESC
       LIMIT 10`,
      [userId]
    );

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      taskId: notif.id_tarea,
      taskTitle: notif.tarea_titulo,
      message: notif.mensaje,
      type: notif.tipo,
      date: notif.fecha_notificacion.toISOString(),
      read: notif.leida,
    }));

    res.json({ notifications: formattedNotifications });
  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    res.status(500).json({ error: "Error al obtener notificaciones.", details: err.message });
  }
});

app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      "UPDATE notificaciones SET leida = TRUE WHERE id = ? AND id_usuario = ?",
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notificación no encontrada o no pertenece al usuario." });
    }

    res.json({ message: "Notificación marcada como leída." });
  } catch (err) {
    console.error("Error al marcar notificación como leída:", err);
    res.status(500).json({ error: "Error al marcar notificación como leída.", details: err.message });
  }
});








// Inicia el servidor
server.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});