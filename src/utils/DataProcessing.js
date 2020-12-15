const generateGW2RosterRecords = (gw2Members, discordMembers) => {
  const sortedGW2Members = gw2Members.sort((a, b) => {
    let value = compareRank(a.rank, b.rank);
    if (value === 0) {
      const bDate = new Date(b.joined);
      const aDate = new Date(a.joined);
      value = aDate - bDate;
    }
    return value;
  });

  const records = sortedGW2Members.map((gw2Member) => {
    let record = {};
    record.accountName = gw2Member.name.split(".")[0];
    record.rank = gw2Member.rank;
    record.joinDate = gw2Member.joined.split("T")[0].replace(/-/g, "/");

    // special case for unique account name
    const testName =
      record.accountName === "52ECA7F4-AF11-4724-9FCD-02A55C4722F6"
        ? "numbers"
        : record.accountName.toLowerCase();

    const discordMember = discordMembers.find((discordMember) =>
      discordMember.name.toLowerCase().includes(testName)
    );

    record.discordName = discordMember ? discordMember.name : "NOT FOUND";
    record.role = discordMember ? formatDiscordRole(discordMember.roles) : "NOT FOUND";
    record.comments = record.rank !== record.role ? "UNMATCHING" : "";

    return record;
  });

  return records;
};

const getExcessDiscordRecords = (gw2Members, discordMembers) => {
  const filtered = discordMembers.filter((discordMember) => {
    const found = gw2Members.find((gw2Member) => {
      const discordName = discordMember.name.toLowerCase();
      const gw2Name =
        gw2Member.name === "52ECA7F4-AF11-4724-9FCD-02A55C4722F6"
          ? "numbers"
          : gw2Member.name.toLowerCase().split(".")[0];

      return discordName.includes(gw2Name);
    });
    return found == null;
  })
  return filtered.sort((a, b) => compareRank(a.roles, b.roles));
};

const compareRank = (aRank, bRank) => {
  const rankSortValues = {
    Spearmarshal: 8,
    General: 7,
    Commander: 6,
    Captain: 5,
    "First Spear": 4,
    "Second Spear": 3,
    Guest: 2,
    Bots: 1,
  };

  const aVal = rankSortValues[aRank] || 0;
  const bVal = rankSortValues[bRank] || 0;

  return bVal - aVal;
};

const formatDiscordRole = (roles) => {
  if (roles === undefined || roles.length === 0) return "NOT FOUND";
  
  let string = "";
  for (let i = 0; i < roles.length; i++) {
    string += i === 0 ? roles[i] : `, ${roles[i]}`;
  }
  return string;
}

export default {
  generateGW2RosterRecords: generateGW2RosterRecords,
  getExcessDiscordRecords: getExcessDiscordRecords,
  formatDiscordRole: formatDiscordRole
};
