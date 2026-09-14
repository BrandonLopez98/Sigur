module.exports = (querys, documentType) => {
  if (!documentType) return querys;

  return querys.filter(
    (query) => query.document_type === documentType
  );
};