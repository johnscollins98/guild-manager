export const fetchDiscordMembers = async () => {
  const response = await fetch(`/api/discord/members`);
  const data = await response.json();
  return data;
};

export const fetchGW2Members = async () => {
  const response = await fetch(`/api/gw2/members`);
  const data = await response.json();
  return data;
};

export const fetchGW2Log = async () => {
  const response = await fetch(`/api/gw2/log`);
  const data = await response.json();
  return data;
};

export default {
  fetchDiscordMembers: fetchDiscordMembers,
  fetchGW2Members: fetchGW2Members,
  fetchGW2Log: fetchGW2Log,
};
