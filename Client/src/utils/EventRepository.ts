import Event from '../Interfaces/Event';
import EventSettings from '../Interfaces/EventSettings';

const EventRepository = {
  getAll: async (): Promise<Event[]> => {
    const response = await fetch('/api/events');
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  getSettings: async (): Promise<EventSettings> => {
    const response = await fetch('/api/events/settings');
    const data = await response.json();
    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  create: async (event: Event): Promise<Event> => {
    const response = await fetch('/api/events', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(event)
    });
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      throw data;
    }
  },

  updateById: async (id: string, event: Event): Promise<Event> => {
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

  deleteById: async (id: string): Promise<boolean> => {
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    if (response.status === 200) {
      return true;
    } else {
      const data = await response.json();
      throw data;
    }
  },

  // this probably isn't the best place to put it - but will go here for now
  postEventsToDiscord: async (channelData: EventSettings) => {
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
