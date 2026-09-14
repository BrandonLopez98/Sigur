const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../db');

/**
 * Crea un error con código HTTP para que la ruta responda correctamente.
 */
function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Verifica las credenciales de un usuario y genera un token JWT.
 *
 * @param {Object} credentials
 * @param {string} credentials.email - Correo del usuario.
 * @param {string} credentials.password - Contraseña escrita en el login.
 * @returns {Promise<Object>} Token y datos seguros del usuario.
 */
module.exports = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(
      'El correo electrónico y la contraseña son obligatorios.',
      400
    );
  }

  // Evita diferencias por espacios o mayúsculas en el correo.
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  // Por seguridad usamos el mismo mensaje si el correo o clave son incorrectos.
  if (!user) {
    throw createHttpError('Credenciales inválidas.', 401);
  }

  // Compara la contraseña escrita con el hash almacenado.
  const passwordIsValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordIsValid) {
    throw createHttpError('Credenciales inválidas.', 401);
  }

  if (user.status && user.status !== 'active') {
    throw createHttpError('Esta cuenta no está activa.', 403);
  }

  if (!process.env.JWT_SECRET) {
    throw createHttpError('JWT_SECRET no está configurado.', 500);
  }

  // El token identifica al usuario durante las siguientes 8 horas.
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // No devolvemos password_hash al frontend.
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};