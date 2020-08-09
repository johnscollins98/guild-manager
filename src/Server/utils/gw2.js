const fetch = require("node-fetch");

const fetchMembers = async (baseUrl, params) => {
  try {
    const url = `${baseUrl}/members`;
    const response = await fetch(url, params);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const fetchLog = async (baseUrl, params) => {
  try {
    const url = `${baseUrl}/log`;
    const response = await fetch(url, params);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const formatLog = (data) => {
  const filtered = data.filter((o) =>
    ["joined", "invited", "kick", "rank_change"].includes(o.type)
  );
  formattedLogs = filtered.map((entry) => formatLogEntry(entry));
  return formattedLogs;
};

const formatLogEntry = (entry) => {
  const type = entry.type;

  const log = {};

  log.date = entry.time.split("T")[0].replace(/-/g, "/");
  log.time = entry.time.split("T")[1].split(".")[0];

  switch (type) {
    case "joined":
      log.message = `${entry.user} joined the guild.`;
      break;
    case "invited":
      log.message = `${entry.user} invited by ${entry.invited_by}`;
      break;
    case "kick":
      if (entry.user == entry.kicked_by) {
        log.message = `${entry.user} left the guild.`;
      } else {
        log.message = `${entry.user} kicked by ${entry.kicked_by}`;
      }
      break;
    case "rank_change":
      log.message = `${entry.changed_by} changed ${entry.user}'s rank from ${entry.old_rank} to ${entry.new_rank}`;
      break;
  }

  return log;
};

module.exports.fetchMembers = fetchMembers;
module.exports.fetchLog = fetchLog;
module.exports.formatLog = formatLog;
