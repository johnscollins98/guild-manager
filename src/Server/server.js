require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

const discordRoute = require("./routes/discord");
const gw2Route = require("./routes/gw2");

app.use("/discord", discordRoute);
app.use("/gw2", gw2Route);

app.listen(port, () => console.info(`Listening on port ${port}`));
