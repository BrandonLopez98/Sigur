const { Query, User } = require('../../db');

module.exports = async (queriesArray) => {
  try {
    if (!Array.isArray(queriesArray) || queriesArray.length === 0) return;

    for (const item of queriesArray) {
      // Si en el JSON nos pasan un email en lugar de un user_id directo
      let userId = item.user_id;

      if (!userId && item.user_email) {
        const userFound = await User.findOne({ where: { email: item.user_email } });
        if (userFound) {
          userId = userFound.id;
        }
      }

      if (!userId) {
        console.error(`No se pudo asignar usuario para la consulta del documento: ${item.document_number}`);
        continue;
      }

      await Query.create({
        user_id: userId,
        document_type: item.document_type,
        document_number: item.document_number,
        search_name: item.search_name || null,
        expedition_date: item.expedition_date || null,
        status: item.status || 'pending',
        risk_level: item.risk_level || 'low',
        pdf_url: item.pdf_url || null,
        completed_at: item.completed_at || null,
      });
    }
    console.log('Queries data loaded.');
  } catch (error) {
    console.error('Error al precargar queries:', error.message);
  }
};