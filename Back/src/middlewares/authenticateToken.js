const jwt = require('jsonwebtoken');

/**
 * Verifica el token enviado por el frontend.
 * Si es válido, agrega sus datos en req.user.
 */
module.exports = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Token de autenticación requerido.',
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      error: 'Token inválido o vencido.',
    });
  }
};