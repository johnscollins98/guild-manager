import fetch from 'node-fetch';

const EventRepository = {
  getAll: async () => {
    const response = await fetch('/api/events');
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  getSettings: async () => {
    const response = await fetch('/api/events/settings');
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  create: async (event) => {
    const response = await fetch('/api/events', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(event)
    });
    const data = await response.json();

    if (response.status === 201) {
      return data;
    } else {
      throw data;
    }
  },

  updateById: async (id, event) => {
    const response = await fetch(`/api/events/${id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(event)
    });
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  deleteById: async (id) => {
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    if (response.status === 204) {
      return true;
    } else {
      const data = await response.json();
      throw data;
    }
  },

  // this probably isn't the best place to put it - but will go here for now
  postEventsToDiscord: async (channelData) => {
    const response = await fetch(`/api/discord/eventUpdate`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(channelData)
    });

    if (response.status === 200) {
      return true;
    } else {
      const data = await response.json();
      throw data;
    }
  }
};

export default EventRepository;
