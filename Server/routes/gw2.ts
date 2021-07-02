import express, { Request, RequestHandler, Response } from 'express';
import fetch from 'node-fetch';
import GW2Member from '../Interfaces/GW2Member';
import { isEventLeader } from '../middleware/auth';
import GuildMember from '../models/guildMember.model';
import PointLog from '../models/pointLog.model';
import * as GW2Utils from '../utils/gw2';
import warningRoute from './warnings';

const router = express.Router();


const baseUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
const apiToken = process.env.GW2_API_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
};

const gatherMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = req.params.member_id;
    const member = await GuildMember.findOne({ memberId });
    if (member) {
      req.member = member;
      return next();
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
};

router.use('/members/:member_id/warnings/', gatherMember, warningRoute);

router.get('/members', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${baseUrl}/members`, reqParams);
    const data: GW2Member[] = await response.json();

    // unique cases for crazy account names
    const uniqueCase = data.find((m) => m.name === 'DD035413-353B-42A1-BAD4-EB58438860CE');
    if (uniqueCase) uniqueCase.name = 'Berry';

    const transformed = await Promise.all(
      data.map(async (m) => {
        const record = await GuildMember.findOneOrCreate(
          { memberId: m.name },
          { memberId: m.name, eventsAttended: 0 }
        );
        return {
          ...m,
          eventsAttended: record.eventsAttended,
          warnings: record.warnings
        };
      })
    );

    res.status(response.status).json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.put('/members/:memberId', isEventLeader, async (req: Request, res: Response) => {
  const { memberId, eventsAttended } = req.body;

  const record = await GuildMember.findOneOrCreate(
    { memberId: req.params.memberId },
    { memberId, eventsAttended }
  );

  const oldAttendance = record.eventsAttended || 0;

  record.eventsAttended = eventsAttended;
  await record.save();

  await new PointLog({
    givenBy: req?.user?.username,
    givenTo: memberId,
    oldVal: oldAttendance,
    newVal: eventsAttended
  }).save();

  res.status(200).json(JSON.stringify(record));
});

router.get('/ranks', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${baseUrl}/ranks`, reqParams);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.get('/log', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${baseUrl}/log`, reqParams);
    const status = response.status;
    const data = await response.json();
    if (status === 200) {
      res.status(200).json(GW2Utils.formatLog(data));
    } else {
      res.status(status).json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.get('/pointlog', async (_req: Request, res: Response) => {
  try {
    const collection = await PointLog.find();
    res.status(200).json(collection);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

export default router;
