export const isPromotionRequired = (rank, dateString) => {
  if (rank !== 'Second Spear') {
    return '';
  }

  const date = new Date(dateString);
  const diffMilliseconds = Math.abs(Date.now() - date);
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

  return diffDays >= 14 ? 'Needs Promotion' : '';
};

export const filterDataByString = (data, filterString) => {
  if (!filterString || filterString === '') return data;

  filterString = filterString.toLowerCase();
  return data.filter(
    (o) =>
      o.accountName?.toLowerCase().includes(filterString) ||
      o.discordName?.toLowerCase().includes(filterString)
  );
};

export const filterLogByString = (data, filterString) => {
  filterString = filterString.toLowerCase();
  return data.filter((entry) =>
    entry.message.toLowerCase().includes(filterString)
  );
};

export const getColorFromRole = (rank, discordRoles) => {
  const found = discordRoles.find((r) => r.name === rank);
  if (found) {
    return `#${found.color.toString(16)}`;
  }
};
