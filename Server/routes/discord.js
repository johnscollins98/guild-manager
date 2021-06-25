const router = require('express').Router();
const fetch = require('node-fetch');
const DiscordUtils = require('../utils/discord');
const Event = require('../models/event.model');
const { isAdmin } = require('../middleware/auth');
const EventPostSettings = require('../models/eventPostSettings.model');

const baseUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}`;
const botToken = process.env.BOT_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bot ${botToken}`,
    'Content-Type': 'application/json',
  },
};

router.get('/roles', async (req, res) => {
  const roles = await fetch(`${baseUrl}/roles`, reqParams);
  const rolesData = await roles.json();
  if (roles.status !== 200) {
    res.status(roles.status).json(rolesData);
    return;
  }

  res.status(200).json(
    await DiscordUtils.getRoleInfo(
      rolesData,
      rolesData.sort((a, b) => b.position - a.position).map((r) => r.id),
      await DiscordUtils.getValidRoles()
    )
  );
});

router.get('/members', async (req, res) => {
  try {
    // fetch member data
    const members = await fetch(`${baseUrl}/members?limit=1000`, reqParams);
    const membersData = await members.json();
    if (members.status !== 200) {
      res.status(members.status).json(membersData);
      return;
    }

    // fetch role data
    const roles = await fetch(`${baseUrl}/roles`, reqParams);
    const rolesData = await roles.json();
    if (roles.status !== 200) {
      res.status(roles.status).json(rolesData);
      return;
    }

    // format and return
    const data = await DiscordUtils.formatMembers(membersData, rolesData);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.put('/members/:memberId/roles/:roleId', isAdmin, async (req, res) => {
  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'PUT' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:memberId/roles/:roleId', isAdmin, async (req, res) => {
  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'DELETE' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:id', isAdmin, async (req, res) => {
  const response = await fetch(`${baseUrl}/members/${req.params.id}`, {
    ...reqParams,
    method: 'DELETE',
  });
  res.status(response.status).json(req.params.id);
});

router.post('/eventUpdate', isAdmin, async (req, res) => {
  try {
    await EventPostSettings.findOneAndUpdate(
      { guildId: process.env.DISCORD_GUILD_ID },
      { ...req.body, guildId: process.env.DISCORD_GUILD_ID },
      { upsert: true }
    );

    const channelId = req.body.channelId;
    const response = await fetch(
      `https://discord.com/api/channels/${channelId}`,
      { ...reqParams }
    );
    if (response.status !== 200) throw await response.json();
    // we have found the channel

    if (req.body.editMessages) {
      // ensure we have all the messages present
      if (!req.body.existingMessageIds) throw 'Missing "existingMessageIds"';
      const messagesResponse = await fetch(
        `https://discord.com/api/channels/${channelId}/messages`,
        { ...reqParams }
      );
      const messages = await messagesResponse.json();
      const values = Object.values(req.body.existingMessageIds);

      for (const id of values) {
        if (!messages.find((m) => m.id === id)) throw 'Invalid Message IDs';
      }
    }

    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    for (day of daysOfWeek) {
      const events = await Event.find({ day }).exec();


      const parseTime = (str) => {
        return Date.parse(`1970/01/01 ${str}`);
      }

      const sorted = events.sort((a, b) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);

        return aTime -  bTime;
      })

      const embed = DiscordUtils.createEmbed(day, sorted);
      if (req.body.editMessages) {
        const messageId = req.body.existingMessageIds[day];
        if (!messageId) throw 'Invalid Message IDs';

        const messageResponse = await fetch(
          `https://discord.com/api/channels/${channelId}/messages/${messageId}`,
          { ...reqParams, method: 'PATCH', body: JSON.stringify({ embed }) }
        );
        if (messageResponse.status !== 200) {
          throw await messageResponse.json();
        }
      } else {
        const messageResponse = await fetch(
          `https://discord.com/api/channels/${channelId}/messages`,
          { ...reqParams, method: 'POST', body: JSON.stringify({ embed }) }
        );
        if (messageResponse.status !== 200) {
          throw await messageResponse.json();
        }
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    res.status(200).json('OK');
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

module.exports = router;
