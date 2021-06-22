const { isAdmin } = require('../middleware/auth');
const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const member = req.member;
    return res.status(200).json(member.warnings);
  } catch (err) {
    return res.status(400).json(`Error: ${err}`);
  }
});

router.get('/:warning_id', async (req, res) => {
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
    return res.status(400).json(`Error: ${err}`);
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const member = req.member;
    const newWarning = req.body;

    member.warnings.push(newWarning);
    const newMember = await member.save();
    res.status(200).json(newMember);
  } catch (err) {
    return res.status(400).json(`Error: ${err}`);
  }
});

router.delete('/:warning_id', isAdmin, async (req, res) => {
  try {
    const member = req.member;
    const warningId = req.params.warning_id;

    const warningToDelete = member.warnings.id(warningId);
    if (warningToDelete) {
      warningToDelete.remove();
      const newMember = await member.save();
      res.status(200).json(newMember);
    } else {
      return res.status(404).json('Not found');
    }
  } catch (err) {
    return res.status(400).json(`Error: ${err}`);
  }
});

router.put('/:warning_id', isAdmin, async (req, res) => {
  try {
    const member = req.member;
    const warningId = req.params.warning_id;

    const toUpdate = member.warnings.id(warningId);
    if (req.body.reason) toUpdate.reason = req.body.reason;
    if (req.body.givenBy) toUpdate.givenBy = req.body.givenBy;

    const newMember = await member.save();
    res.status(200).json(newMember);
  } catch (err) {
    return res.status(400).json(`Error: ${err}`);
  }
});

module.exports = router;
