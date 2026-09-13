/**
 * Filtra un arreglo de consultas por nombre o número de documento.
 * Esta función no consulta la base de datos: solo trabaja con el arreglo recibido.
 */
module.exports = (querys, search) => {
  const term = search?.trim().toLowerCase();

  if (!term) {
    return querys;
  }

  return querys.filter((query) => {
    const name = (query.search_name || '').toLowerCase();
    const documentNumber = String(query.document_number || '').toLowerCase();

    return name.includes(term) || documentNumber.includes(term);
  });
};
