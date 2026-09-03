const { Query, User } = require('../../db');

module.exports = async ({ user_id, document_type, document_number, search_name, expedition_date, status, risk_level, pdf_url }) => {
  try {
    // 1. Validar que llegue el user_id obligatoriamente
    if (!user_id) {
      throw new Error('El ID del usuario (user_id) es obligatorio para crear una query.');
    }

    // 2. Verificar que el usuario exista en la base de datos
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      throw new Error(`El usuario con el ID ${user_id} no existe en la base de datos.`);
    }

    // 3. Crear la query vinculada al usuario utilizando los campos definidos en tu modelo
    const nuevaQuery = await Query.create({
      user_id,
      document_type,
      document_number,
      search_name,
      expedition_date,
      status,
      risk_level,
      pdf_url
    });

    return nuevaQuery;
  } catch (error) {
    throw new Error(`Error al crear la query: ${error.message}`);
  }
};