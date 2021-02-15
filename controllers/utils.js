function getStatus(total, position) {
  const percentile = position / total;

  if (position === 1) {
    return "GOAT";
  }

  if (percentile <= 0.2) {
    return "Legend";
  }

  if (percentile <= 0.3) {
    return "Boss";
  }

  if (percentile <= 0.6) {
    return "Peasant";
  }

  return "Needs improvement";
}

module.exports = getStatus;
