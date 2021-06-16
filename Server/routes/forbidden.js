const router = require('express').Router();
const path = require('path');

router.get('/', (req, res) => {
  res
    .status(403)
    .sendFile(
      path.join(__dirname, '..', '..', 'Client', 'build', 'forbidden.html')
    );
});

module.exports = router;
