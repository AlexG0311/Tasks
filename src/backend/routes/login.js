import { Router } from "express";
import { db } from '../conexion/MySql.js';
import { compare} from "bcrypt";
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { JWT_SECRET } from "../JWT/authenticateToken.js";

export const RouterLogin = Router();

RouterLogin.post('/', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [user] = await db.query(
        `SELECT u.id, u.email, u.password, r.nombre AS role 
         FROM users u
         LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
         LEFT JOIN rol r ON ur.rol_id = r.id
         WHERE u.email = ?`,
        [email]
      );
  
      if (user.length === 0) {
        return res.status(401).json({ error: "Credenciales incorrectas." });
      }
  
      const isMatch = await compare(password, user[0].password);
      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales incorrectas." });
      }
  
      const token = sign(
        { id: user[0].id, email: user[0].email, role: user[0].role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });
  
      res.json({ 
        message: "Login exitoso", 
        user: { 
          id: user[0].id, 
          email: user[0].email, 
          role: user[0].role 
        } 
      });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      res.status(500).json({ error: "Error al iniciar sesión.", details: err.message });
    }
  });