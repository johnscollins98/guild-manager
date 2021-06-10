const router = require('express').Router();
const { isAdmin } = require('../middleware/auth');
const Event = require('../models/event.model');
const EventPostSettings = require('../models/eventPostSettings.model');

router.get('/settings', async (req, res) => {
  try {
    const settings = await EventPostSettings.findOne({ guildId: process.env.DISCORD_GUILD_ID });
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(400).json(err);
  }
})

router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}).exec();
    return res.status(200).json(events);
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).exec();
    if (event) {
      return res.status(200).json(event);
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const body = req.body;
    const event = await new Event({ ...body }).save();
    return res.status(201).json(event);
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findByIdAndDelete(id);
    if (event) {
      return res.status(204).json({});
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findByIdAndUpdate(id, { ...req.body }, { new: true }).exec();
    if (event) {
      return res.status(200).json(event);
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

module.exports = router;
