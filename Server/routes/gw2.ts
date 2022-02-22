import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../config';
import GW2Member from '../interfaces/GW2Member';
import * as GW2Utils from '../utils/gw2';

const router = express.Router();

const baseUrl = `https://api.guildwars2.com/v2/guild/${config.gw2guildId}`;
const reqParams = {
  headers: {
    Authorization: `Bearer ${config.gw2apiToken}`
  }
};

router.get('/members', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${baseUrl}/members`, reqParams);
    const data: GW2Member[] = await response.json();

    // unique cases for crazy account names
    const uniqueCase = data.find((m) => m.name === 'DD035413-353B-42A1-BAD4-EB58438860CE');
    if (uniqueCase) uniqueCase.name = 'Berry';

    res.set('Cache-control', `public, max-age=0`);
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.get('/ranks', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${baseUrl}/ranks`, reqParams);
    const data = await response.json();

    res.status(response.status).json(data);
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

export default router;
