require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

const discordRoute = require("./routes/discord");
const gw2Route = require("./routes/gw2");

app.use(express.static(path.join(__dirname, "../../build")));
app.use("/api/discord", discordRoute);
app.use("/api/gw2", gw2Route);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "../../build/index.html"));
});

app.listen(port, () => console.info(`Listening on port ${port}`));
