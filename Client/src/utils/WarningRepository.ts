import fetch from 'node-fetch';
import Warning, { WarningPost } from '../Interfaces/Warning';

const WarningRepository = {
  getWarningsForMember: async (memberId: string): Promise<Warning[]> => {
    const url = `/api/warnings/${memberId}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  getWarnings: async () : Promise<Warning[]> => {
    const url = `/api/warnings`;
    const response= await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  getWarning: async (warningId: string): Promise<Warning> => {
    const url = `/api/warnings/${warningId}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  addWarning: async (warningObject: WarningPost): Promise<Warning> => {
    const url = `/api/warnings`;
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

  deleteWarning: async (warningId: string): Promise<Warning> => {
    const url = `/api/warnings/${warningId}`;
    const response = await fetch(url, { method: 'DELETE' });
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  updateWarning: async (
    warningId: string,
    warningObject: WarningPost
  ): Promise<Warning> => {
    const url = `/api/warnings/${warningId}`;
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
