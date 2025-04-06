import { Router } from "express";
import { authenticateToken } from "../JWT/authenticateToken.js";
import { db } from "../conexion/MySql.js";
export const RouterUser = Router();

RouterUser.get('/' , authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.first_name AS firstName, u.last_name AS lastName, u.email, r.nombre AS role
       FROM users u
       LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
       LEFT JOIN rol r ON ur.rol_id = r.id`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}); 


