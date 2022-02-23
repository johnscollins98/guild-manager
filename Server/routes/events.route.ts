import express, { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth.middleware';
import { Event } from '../models/event.model';
import IEvent from '../interfaces/event.interface';
import { EventPostSettings } from '../models/eventPostSettings.model';
import { config } from '../config';
import { getRepository } from 'typeorm';

const router = express.Router();

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const eventPostRepo = getRepository(EventPostSettings);
    let settings = await eventPostRepo.findOne({ guildId: config.discordGuildId });
    if (!settings) {
      const toSave = new EventPostSettings();
      toSave.guildId = config.discordGuildId
      settings = await eventPostRepo.save(toSave);
    }

    return res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const eventRepo = getRepository(Event);
    const events = await eventRepo.find();
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const eventRepo = getRepository(Event);
    const event = await eventRepo.findOne(req.params.id);
    if (event) {
      return res.status(200).json(event);
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.post('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const eventRepo = getRepository(Event);
    const body: IEvent = req.body;
    const event: IEvent = await eventRepo.save({ ...body });
    return res.status(201).json(event);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const eventRepo = getRepository(Event);
    const result = await eventRepo.delete(id);
    if (result.affected === 1) {
      return res.status(204).json({});
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.put('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const eventRepo = getRepository(Event);
    const updateResult = await eventRepo.update(id, { ...req.body });
    if (updateResult.affected === 1) {
      const event = await eventRepo.findOne(id);
      return res.status(200).json(event);
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

export default router;
