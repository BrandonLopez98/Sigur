module.exports = (querys, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return querys;

  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

  return querys.filter((query) => {
    const createdAt = new Date(query.created_at);

    if (from && createdAt < from) return false;
    if (to && createdAt > to) return false;

    return true;
  });
};