export const isPromotionRequired = (rank, dateString, eventsAttended) => {
  const date = new Date(dateString);
  const diffMilliseconds = Math.abs(Date.now() - date);
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
  if (rank === 'Second Spear') {
    return diffDays >= 14 ? 'Needs Promotion' : '';
  } else if (rank === 'First Spear') {
    const pointThreshold = 25; // approx 1 event per week for 6 months
    const daysThreshold = 180; // approx 6 months
    return eventsAttended >= pointThreshold && diffDays >= daysThreshold;
  } else {
    return false;
  }
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
