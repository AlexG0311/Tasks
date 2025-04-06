import pkg from 'jsonwebtoken';
const { verify } = pkg;




export const JWT_SECRET = "1234";

// Middleware de autenticación
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
};