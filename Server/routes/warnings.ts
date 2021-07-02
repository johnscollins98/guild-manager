import { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth';
import express from 'express';
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const member = req.member;
    return res.status(200).json(member.warnings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
});

router.get('/:warning_id', async (req: Request, res: Response) => {
  try {
    const member = req.member;
    const warningId = req.params.warning_id;

    const warning = member.warnings.id(warningId);
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
    const member = req.member;
    const newWarning = req.body;

    newWarning.givenBy = req?.user?.username;
    member.warnings.push(newWarning);
    const newMember = await member.save();
    res.status(200).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.delete('/:warning_id', isAdmin, async (req: Request, res: Response) => {
  try {
    const member = req.member;
    const warningId = req.params.warning_id;

    const warningToDelete = member.warnings.id(warningId);
    if (warningToDelete) {
      warningToDelete.remove();
      const newMember = await member.save();
      res.status(200).json(newMember);
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
    const member = req.member;
    const warningId = req.params.warning_id;

    const toUpdate = member.warnings.id(warningId);
    if (req.body.reason && toUpdate) toUpdate.reason = req.body.reason;

    const newMember = await member.save();
    res.status(200).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

export default router;
