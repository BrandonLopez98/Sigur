const filterByNameOrDocument = require('./filterByNameOrDocument');

/**
 * Punto central para combinar los filtros del historial.
 * Aquí se añadirá cada filtro nuevo sin modificar getQuerys.
 */
module.exports = (querys, filters = {}) => {
  let filteredQuerys = [...querys];

  filteredQuerys = filterByNameOrDocument(filteredQuerys, filters.search);

  return filteredQuerys;
};
