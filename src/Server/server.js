require("dotenv").config();
const express = require("express");
const app = express();

const port = process.env.SERVER_PORT || 3001;

const discordRoute = require("./routes/discord");

app.use("/discord", discordRoute);

app.listen(port, () => console.info(`Listening on port ${port}`));
