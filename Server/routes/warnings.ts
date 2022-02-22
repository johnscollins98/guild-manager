import { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth';
import express from 'express';
import Warning from '../models/warnings';
const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const warnings = await Warning.find().exec();
    return res.status(200).json(warnings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
})

router.get('/member/:member_id', async (req: Request, res: Response) => {
  try {
    const memberId = req.params.member_id;
    const warnings = await Warning.find({ givenTo: memberId }).exec();
    return res.status(200).json(warnings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
});

router.get('/:warning_id', async (req: Request, res: Response) => {
  try {
    const warningId = req.params.warning_id;
    const warning = await Warning.findById(warningId).exec();

    if (warning) {
      res.status(200).json(warning);
    } else {
      res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.post('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const newWarning = req.body;
    newWarning.givenBy = req?.user?.username;
    const savedWarning = await new Warning(newWarning).save();
    res.status(200).json(savedWarning);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.delete('/:warning_id', isAdmin, async (req: Request, res: Response) => {
  try {
    const warningId = req.params.warning_id;
    const result = await Warning.findByIdAndDelete(warningId).exec();
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.put('/:warning_id', isAdmin, async (req: Request, res: Response) => {
  try {
    const warningId = req.params.warning_id;

    const updated = await Warning.findByIdAndUpdate(warningId, { reason: req.body.reason }).exec();

    if (updated) {
      res.status(200).json(updated)
    } else {
      res.status(404).json('Not found');
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

export default router;
