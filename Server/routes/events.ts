import express, { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth';
import Event from '../models/event.model';
import IEvent from '../Interfaces/IEvent';
import EventPostSettings from '../models/eventPostSettings.model';

const router = express.Router();

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await EventPostSettings.findOne({
      guildId: process.env.DISCORD_GUILD_ID
    });
    return res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const events: IEvent[] = await Event.find({}).exec();
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).exec();
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
    const body: IEvent = req.body;
    const event: IEvent = await new Event({ ...body }).save();
    return res.status(201).json(event);
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const event: IEvent | null = await Event.findByIdAndDelete(id);
    if (event) {
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
    const event: IEvent | null = await Event.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    ).exec();
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

export default router;
