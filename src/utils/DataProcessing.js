import { isPromotionRequired } from './Helpers';

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
    record.accountName = gw2Member.name.split('.')[0];
    record.rank = gw2Member.rank;
    record.joinDate = gw2Member.joined.split('T')[0].replace(/-/g, '/');

    // special case for unique account name
    const testName = record.accountName.toLowerCase();

    // check for exact match
    let discordMember = discordMembers.find(
      (m) => m.name.toLowerCase() === testName
    );

    // check for name before are after a space
    if (!discordMember) {
      discordMember = discordMembers.find((m) => {
        const testAfter = new RegExp(`${testName}\\s`);
        const testBefore = new RegExp(`\\s${testName}`);
        return (
          m.name.toLowerCase().match(testAfter) ||
          m.name.toLowerCase().match(testBefore)
        );
      });
    }

    // check for name inside parenthesis
    if (!discordMember) {
      discordMember = discordMembers.find((m) => {
        const test = new RegExp(`\\(${testName}\\)`);
        return m.name.toLowerCase().match(test);
      });
    }

    // check for any inclusion
    if (!discordMember) {
      discordMember = discordMembers.find((m) =>
        m.name.toLowerCase().includes(testName)
      );
    }

    record = {
      ...record,
      discordName: discordMember?.name,
      discordId: discordMember?.id,
      roles: discordMember?.roles || [],
    };

    record.issues = {
      missingDiscord: !record.discordName,
      multipleRoles: record.roles?.length > 1,
      unmatchingRoles: record.discordName && record.rank !== record.roles[0]?.name,
      promotionRequired: isPromotionRequired(record.rank, record.joinDate)
    }

    return record;
  });

  return records;
};

const getExcessDiscordRecords = (gw2Members, discordMembers) => {
  const records = generateGW2RosterRecords(gw2Members, discordMembers);
  return discordMembers
    .filter((discordMember) => {
      return !records.some(
        (record) => record.discordName === discordMember.name
      );
    })
    .map((discordMember) => {
      return { 
        accountName: discordMember.name,
        rank: "-",
        joinDate: "-",
        discordName: discordMember.name,
        discordId: discordMember.id,
        roles: discordMember.roles || [],
        issues: {
          missingGW2: !(discordMember.roles.find(r => r.name === "Guest" || r.name === "Bots")),
          multipleRoles: discordMember.roles.length > 1
        }
      };
    })
    .sort((a, b) => compareRank(a.roles[0]?.name, b.roles[0]?.name ));
};

const compareRank = (aRank, bRank) => {
  const rankSortValues = {
    Spearmarshal: 9,
    General: 8,
    Commander: 7,
    Captain: 6,
    'First Spear': 5,
    'Second Spear': 4,
    'Third Spear': 3,
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
