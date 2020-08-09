const express = require("express");
const app = express();

const port = process.env.SERVER_PORT || 3001;

app.listen(port, () => console.info(`Listening on port ${port}`));
