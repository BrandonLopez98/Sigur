/**
 * Permite acceder a una ruta solo a usuarios con alguno de los roles indicados.
 *
 * Debe usarse después de authenticateToken.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción.',
      })
    }

    next()
  }
}

module.exports = authorizeRoles