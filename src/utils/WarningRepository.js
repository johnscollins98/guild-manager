import fetch from 'node-fetch';

const WarningRepository = {
  getWarnings: async (memberId) => {
    const url = `/api/gw2/members/${memberId}/warnings`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  getWarning: async (memberId, warningId) => {
    const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  addWarning: async (memberId, warningObject) => {
    const url = `/api/gw2/members/${memberId}/warnings`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(warningObject)
    });
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  deleteWarning: async (memberId, warningId) => {
    const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
    const response = await fetch(url, { method: 'DELETE' });
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  updateWarning: async (memberId, warningId, warningObject) => {
    const url = `/api/gw2/members/${memberId}/warnings/${warningId}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(warningObject)
    });
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  }
};

export default WarningRepository;
