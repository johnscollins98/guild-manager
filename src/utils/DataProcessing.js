import { isPromotionRequired } from './Helpers';

export const generateGW2RosterRecords = (gw2Members, discordMembers, ranks) => {
  const sortedGW2Members = gw2Members.sort((a, b) => {
    let value = compareRank(ranks, a.rank, b.rank);
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
    record.memberId = gw2Member.name;
    record.rank = gw2Member.rank;
    record.joinDate = gw2Member.joined.split('T')[0].replace(/-/g, '/');
    record.eventsAttended = gw2Member.eventsAttended;

    // special case for unique account name
    const testName = record.accountName.toLowerCase();

    // check for exact match
    let discordMember = discordMembers.find((m) => {
      const discordName = m.name
        .toLowerCase()
        .replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ''
        ) // strip any emojis
        .trim(); // trim any leading/trailing whitespace (should only be present if they have an emoji at the start)

      return discordName === testName || discordName.includes(`(${testName})`);
    });

    record = {
      ...record,
      discordName: discordMember?.name,
      discordId: discordMember?.id,
      roles: discordMember?.roles || [],
    };

    record.issues = {
      missingDiscord: record.rank !== 'Alt' && !record.discordName,
      multipleRoles: record.roles?.length > 1,
      unmatchingRoles:
        record.discordName && record.rank !== record.roles[0]?.name,
      promotionRequired: isPromotionRequired(
        record.rank,
        record.joinDate,
        record.eventsAttended
      ),
    };

    return record;
  });

  return records;
};

export const getExcessDiscordRecords = (gw2Members, discordMembers, ranks) => {
  const records = generateGW2RosterRecords(gw2Members, discordMembers, ranks);
  return discordMembers
    .filter((discordMember) => {
      return !records.some(
        (record) => record.discordName === discordMember.name
      );
    })
    .map((discordMember) => {
      return {
        accountName: discordMember.name,
        rank: '-',
        joinDate: '-',
        discordName: discordMember.name,
        discordId: discordMember.id,
        roles: discordMember.roles || [],
        issues: {
          missingGW2: !discordMember.roles.find(
            (r) => r.name === 'Guest' || r.name === 'Bots'
          ),
          multipleRoles: discordMember.roles.length > 1,
        },
      };
    })
    .sort((a, b) => compareRank(ranks, a.roles[0]?.name, b.roles[0]?.name));
};

const compareRank = (ranks, aRank, bRank) => {
  ranks.push({ id: 'Guest', order: ranks.length });
  ranks.push({ id: 'Bots', order: ranks.length });
  const aObj = ranks.find((o) => o.id === aRank) || { order: ranks.length };
  const bObj = ranks.find((o) => o.id === bRank) || { order: ranks.length };

  return aObj.order - bObj.order;
};
