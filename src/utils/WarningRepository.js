import fetch from 'node-fetch';

const getWarnings = async (memberId) => {
  const url = `/api/gw2/members/${memberId}/warnings`;
  const response = await fetch(url);
  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw data;
  }
};

const getWarning = async (memberId, warningId) => {
  const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
  const response = await fetch(url);
  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw data;
  }
};

const addWarning = async (memberId, warningObject) => {
  const url = `/api/gw2/members/${memberId}/warnings`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(warningObject),
  });
  const data = await response.json();

  if (response.status === 200) {
    return data;
  } else {
    throw data;
  }
};

const deleteWarning = async (memberId, warningId) => {
  const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();

  if (response.status === 200) {
    return data;
  } else {
    throw data;
  }
};

const updateWarning = async (memberId, warningId, warningObject) => {
  const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(warningObject),
  });
  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw data;
  }
};

export default {
  getWarnings,
  getWarning,
  addWarning,
  deleteWarning,
  updateWarning,
};
