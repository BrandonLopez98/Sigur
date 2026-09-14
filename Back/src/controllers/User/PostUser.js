const { User } = require('../../db');

module.exports = async ({ email, passwordHash, status, role }) => {
  try {
    // 1. Validar que el email sea obligatorio
    if (!email) {
      throw new Error('El correo electrónico es obligatorio para registrar un usuario.');
    }

    // 2. Validar que el password_hash sea obligatorio
    if (!passwordHash) {
      throw new Error('La contraseña es obligatoria.');
    }

    // 3. Verificar si ya existe un usuario registrado con el mismo correo
    const usuarioExistente = await User.findOne({
      where: { email },
    });

    if (usuarioExistente) {
      throw new Error(`Ya existe un usuario registrado con el correo ${email}.`);
    }

    // 4. Crear el nuevo usuario pasando los campos opcionales por si se envían
    const nuevoUsuario = await User.create({
      email,
      password_hash: passwordHash,
      status, // Sequelize usará el default ('active') si viene undefined
      role,   // Sequelize usará el default ('client') si viene undefined
    });

    return nuevoUsuario;
  } catch (error) {
    console.error('Error al registrar el usuario:', error.message);
    throw error;
  }
};