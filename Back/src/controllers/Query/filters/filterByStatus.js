module.exports = (querys, status) => {
  if (!status) return querys;

  return querys.filter(
    (query) => query.status === status
  );
};