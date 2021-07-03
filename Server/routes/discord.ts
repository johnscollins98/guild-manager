import express from 'express';
import fetch from 'node-fetch';
import * as DiscordUtils from '../utils/discord';
import Event from '../models/event.model';
import { isAdmin } from '../middleware/auth';
import EventPostSettings from '../models/eventPostSettings.model';
import { Request, Response } from 'express';
import DiscordRole from '../Interfaces/DiscordRole';
import DiscordMessage from '../Interfaces/DiscordMessage';
import IEvent from '../Interfaces/IEvent';
import DiscordMember from '../Interfaces/DiscordMember';

const router = express.Router();

const baseUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}`;
const botToken = process.env.BOT_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bot ${botToken}`,
    'Content-Type': 'application/json'
  }
};

router.get('/roles', async (_req: Request, res: Response) => {
  const roles = await fetch(`${baseUrl}/roles`, reqParams);
  const rolesData: DiscordRole[] = await roles.json();
  if (roles.status !== 200) {
    res.status(roles.status).json(rolesData);
    return;
  }

  res.status(200).json(
    DiscordUtils.getRoleInfo(
      rolesData,
      rolesData.sort((a, b) => b.position - a.position).map((r) => r.id),
      await DiscordUtils.getValidRoles()
    )
  );
});

router.get('/members', async (_req: Request, res: Response) => {
  try {
    // fetch member data
    const members = await fetch(`${baseUrl}/members?limit=1000`, reqParams);
    const membersData: DiscordMember[] = await members.json();
    if (members.status !== 200) {
      res.status(members.status).json(membersData);
      return;
    }

    // fetch role data
    const roles = await fetch(`${baseUrl}/roles`, reqParams);
    const rolesData: DiscordRole[] = await roles.json();
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

router.put('/members/:memberId/roles/:roleId', isAdmin, async (req: Request, res: Response) => {
  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'PUT' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:memberId/roles/:roleId', isAdmin, async (req: Request, res: Response) => {
  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'DELETE' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:id', isAdmin, async (req: Request, res: Response) => {
  const response = await fetch(`${baseUrl}/members/${req.params.id}`, {
    ...reqParams,
    method: 'DELETE'
  });
  res.status(response.status).json(req.params.id);
});

router.post('/eventUpdate', isAdmin, async (req: Request, res: Response) => {
  try {
    await EventPostSettings.findOneAndUpdate(
      { guildId: process.env.DISCORD_GUILD_ID },
      { ...req.body, guildId: process.env.DISCORD_GUILD_ID },
      { upsert: true }
    );

    const channelId: string = req.body.channelId;
    const response = await fetch(`https://discord.com/api/channels/${channelId}`, { ...reqParams });
    if (response.status !== 200) throw await response.json();
    // we have found the channel

    if (req.body.editMessages) {
      // ensure we have all the messages present
      if (!req.body.existingMessageIds) throw 'Missing "existingMessageIds"';
      const messagesResponse = await fetch(
        `https://discord.com/api/channels/${channelId}/messages`,
        { ...reqParams }
      );
      const messages: DiscordMessage[] = await messagesResponse.json();
      const values: string[] = Object.values(req.body.existingMessageIds);

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
      'Sunday'
    ];
    for (const day of daysOfWeek) {
      const events = await Event.find({ day }).exec();

      const parseTime = (str: string) => {
        return Date.parse(`1970/01/01 ${str}`);
      };

      const sorted = events.sort((a: IEvent, b: IEvent) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);

        return aTime - bTime;
      });

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

export default router;
