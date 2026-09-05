const { Query } = require('../../db');

module.exports = async (id) => {
  try {
    // Si llega un id, buscamos únicamente el query con ese id
    if (id) {
      const query = await Query.findAll({ where: { user_id:id } });
      if (!query) {
        throw new Error(`No se encontró query con el id: ${id}`);
      }
      return query; // Retorna un objeto con el query encontrado
    }
    // Si no llega ningún id, devolvemos todos los usuarios
    const querys = await Query.findAll();
    return querys;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
}; 

