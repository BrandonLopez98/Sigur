module.exports = (querys, riskLevel) => {
  if (!riskLevel) return querys;

  return querys.filter(
    (query) => query.risk_level === riskLevel
  );
};