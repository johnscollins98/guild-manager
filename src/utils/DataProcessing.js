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
    const testName = record.accountName.toLowerCase();

    // check for whole word first
    let discordMember = discordMembers.find((discordMember) =>
      discordMember.name
        .toLowerCase()
        .match(new RegExp(`(?<!\\w)${testName}(?!\\w)`))
    );

    // then check for any inclusion.
    if (!discordMember) {
      discordMember = discordMembers.find((discordMember) =>
        discordMember.name.toLowerCase().includes(testName)
      );
    }

    if (discordMember) {
      const roleString = discordMember.roles.map(r => r.name).join(", ")

      record = { ...record,
        discordName: discordMember.name,
        discordId: discordMember.id,
        roles: discordMember.roles,
        roleString: roleString.length ? roleString : "NOT FOUND"
      }
    } else {
      record ={ ...record, 
        discordName: "NOT FOUND",
        discordId: null,
        roles: [],
        roleString: "NOT FOUND"
      }
    }

    record.comments = record.rank !== record.roleString ? "UNMATCHING" : "";

    return record;
  });

  return records;
};

const getExcessDiscordRecords = (gw2Members, discordMembers) => {
  return discordMembers
    .filter((discordMember) => {
      return !gw2Members.some((gw2Member) => {
        const discordName = discordMember.name.toLowerCase();
        const gw2Name = gw2Member.name.toLowerCase().split(".")[0];

        return discordName.includes(gw2Name);
      })
    })
    .map((discordMember) => {
      const roleString = discordMember.roles.map(r => r.name).join(", ") || "NOT FOUND";
      return { ...discordMember, roleString }
    })
    .sort((a, b) => compareRank(a.roleString, b.roleString));
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

export default {
  generateGW2RosterRecords: generateGW2RosterRecords,
  getExcessDiscordRecords: getExcessDiscordRecords,
};
