const filterByNameOrDocument = require("./filterByNameOrDocument");
const filterByDocumentType = require("./filterByDocumentType");
const filterByStatus = require("./filterByStatus");
const filterByRiskLevel = require("./filterByRiskLevel");
const filterByDateRange = require("./filterByDateRange");

module.exports = (querys, filters = {}) => {
  let filteredQuerys = [...querys];

  filteredQuerys = filterByNameOrDocument(filteredQuerys, filters.search);
  filteredQuerys = filterByDocumentType(
    filteredQuerys,
    filters.document_type
  );
  filteredQuerys = filterByStatus(filteredQuerys, filters.status);
  filteredQuerys = filterByRiskLevel(
    filteredQuerys,
    filters.risk_level
  );
  filteredQuerys = filterByDateRange(
    filteredQuerys,
    filters.date_from,
    filters.date_to
  );

  return filteredQuerys;
};