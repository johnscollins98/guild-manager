import { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth';
import express from 'express';
import WarningsRepository from '../repositories/warnings.repository';
const router = express.Router();

const warningRepo = new WarningsRepository();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const warnings = await warningRepo.getAll();
    return res.status(200).json(warnings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
})

router.get('/member/:member_id', async (req: Request, res: Response) => {
  try {
    const memberId = req.params.member_id;
    const warnings = await warningRepo.getForMember(memberId);
    return res.status(200).json(warnings);
  } catch (err) {
    console.error(err);
    return res.status(400).json(`Error: ${err}`);
  }
});

router.get('/:warning_id', async (req: Request, res: Response) => {
  try {
    const warningId = req.params.warning_id;
    const warning = await warningRepo.get(warningId);

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
    const savedWarning = await warningRepo.create(newWarning);
    res.status(200).json(savedWarning);
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error: ${err}`);
  }
});

router.delete('/:warning_id', isAdmin, async (req: Request, res: Response) => {
  try {
    const warningId = req.params.warning_id;
    const result = await warningRepo.delete(warningId);
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
    const updated = await warningRepo.update(warningId, req.body);
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
