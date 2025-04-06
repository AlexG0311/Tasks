import {Router} from 'express'
import { db } from '../conexion/MySql.js';
import { hash} from "bcrypt";

export const RouterRegistrar = Router();


RouterRegistrar.post('/', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const [userResult] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword]
    );

    const userId = userResult.insertId;

    const [roleResult] = await db.query("SELECT id FROM rol WHERE nombre = ?", [role]);
    if (roleResult.length === 0) {
      return res.status(400).json({ error: "El rol seleccionado no existe." });
    }
    const roleId = roleResult[0].id;

    await db.query("INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)", [userId, roleId]);

    res.status(201).json({ message: "Usuario registrado exitosamente con rol asignado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
});

