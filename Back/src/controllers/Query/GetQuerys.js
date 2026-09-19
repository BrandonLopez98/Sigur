const { Query } = require('../../db');

module.exports = async (user_id) => {
  try {
    // Si llega un id, buscamos únicamente el query con ese id
    if (user_id) {
      return Query.findAll({
        where: { user_id },
        // El historial siempre muestra la consulta más reciente primero.
        order: [['created_at', 'DESC']],
      });
    }
    // Si no llega ningún id, devolvemos todos los usuarios
    const querys = await Query.findAll({
      order: [['created_at', 'DESC']],
    });
    return querys;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
}; 
