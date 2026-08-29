const { User } = require('../../db');

module.exports = async (email) => {
  try {
    // Si llega un email, buscamos únicamente ese usuario
    if (email) {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        throw new Error(`No se encontró ningún usuario con el correo: ${email}`);
      }
      
      return user; // Retorna un objeto con el usuario encontrado
    }

    // Si no llega ningún email, devolvemos todos los usuarios
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
};