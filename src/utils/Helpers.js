export const formatRankId = (rank) => {
  if (rank == null || rank.length === 0) {
    return "not-found";
  }
  return rank.toLowerCase().split(" ").join("-");
};

export const isPromotionRequired = (rank, dateString) => {
  if (rank !== "Second Spear") {
    return "";
  }

  const date = new Date(dateString);
  const diffMilliseconds = Math.abs(Date.now() - date);
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

  return diffDays >= 14 ? "Needs Promotion" : "";
};

export const filterDataByString = (data, filterString) => {
  filterString = filterString.toLowerCase();

  const stringCheck = (str) => {
    return str.toLowerCase().includes(filterString);
  }

  const recursiveCheck = (object) => {
    let found = false;
    const values = Object.values(object);
    for (const value of values) {
      found = typeof value === "string" ? stringCheck(value) : recursiveCheck(value);
      if (found) return true;
    }
    return false;
  };

  return data.filter(recursiveCheck);
};
