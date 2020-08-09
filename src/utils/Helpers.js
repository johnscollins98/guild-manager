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
  const diffDays = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));

  return diffDays >= 14 ? "Needs Promotion" : "";
};

export const filterDataByString = (data, filterString) => {
  return data.filter((object) => {
    const values = Object.values(object);
    for (const value of values) {
      if (value.toLowerCase().includes(filterString.toLowerCase())) {
        return true;
      }
    }
    return false;
  });
};
