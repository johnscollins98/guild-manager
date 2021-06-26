export const fetchDiscordMembers = async () => {
  const response = await fetch(`/api/discord/members`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchDiscordRoles = async () => {
  const response = await fetch(`api/discord/roles`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const addDiscordRole = async (memberId, roleId) => {
  const response = await fetch(
    `api/discord/members/${memberId}/roles/${roleId}`,
    { method: 'PUT' }
  );
  return response.status === 204;
};

export const removeDiscordRole = async (memberId, roleId) => {
  const response = await fetch(
    `api/discord/members/${memberId}/roles/${roleId}`,
    { method: 'DELETE' }
  );
  return response.status === 204;
};

export const kickDiscordMember = async (memberId) => {
  const response = await fetch(`/api/discord/members/${memberId}`, {
    method: 'DELETE',
  });
  return response.status === 204;
};

export const fetchGW2Members = async () => {
  const response = await fetch(`/api/gw2/members`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchGW2Ranks = async () => {
  const response = await fetch(`/api/gw2/ranks`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchGW2Log = async () => {
  const response = await fetch(`/api/gw2/log`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const setGuildMember = async (newMember) => {
  const response = await fetch(`/api/gw2/members/${newMember.memberId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(newMember),
  });

  if (response.status !== 200) {
    throw response;
  }

  const data = await response.json();
  return JSON.parse(data);
};

export const fetchAuthInfo = async () => {
  const response = await fetch('/auth/authorization');
  const data = await response.json();
  
  if (response.status === 303) {
    window.location.href = data.redirectUrl;
    return;
  }

  if (response.status !== 200) {
    throw data;
  }

  return JSON.parse(data);
};

export const fetchPointLog = async () => {
  const response = await fetch('/api/gw2/pointlog');
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data.reverse();
};
