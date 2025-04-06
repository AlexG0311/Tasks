import { Router } from "express";
import { authenticateToken } from "../JWT/authenticateToken.js";
import { db } from "../conexion/MySql.js";
export const RouterWorkspace = Router();


RouterWorkspace.post('/', authenticateToken, async (req, res) => {
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


RouterWorkspace.get('/', authenticateToken, async (req, res) => {
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

  RouterWorkspace.put('/:id', authenticateToken, async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user.id;
    const { name } = req.body;
  
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre del espacio de trabajo es obligatorio." });
    }
  
    try {
      const [workspace] = await db.query(
        "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
        [workspaceId, userId]
      );
  
      if (workspace.length === 0) {
        return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
      }
  
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

  RouterWorkspace.delete('/:id',authenticateToken, async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user.id;
  
    try {
      const [workspace] = await db.query(
        "SELECT id FROM workspaces WHERE id = ? AND created_by = ?",
        [workspaceId, userId]
      );
  
      if (workspace.length === 0) {
        return res.status(404).json({ error: "Espacio de trabajo no encontrado o no tienes permisos." });
      }
  
      await db.query("DELETE FROM workspaces WHERE id = ?", [workspaceId]);
  
      res.json({ message: "Espacio de trabajo eliminado exitosamente." });
    } catch (err) {
      console.error("Error al eliminar el espacio de trabajo:", err);
      res.status(500).json({ error: "Error al eliminar el espacio de trabajo." });
    }
  });