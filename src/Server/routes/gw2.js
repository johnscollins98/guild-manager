const router = require("express").Router();
const GW2Utils = require("../utils/gw2");

const baseUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
const apiToken = process.env.GW2_API_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bearer ${apiToken}`,
  },
};

router.get("/members", async (req, res) => {
  const data = await GW2Utils.fetchMembers(baseUrl, reqParams);
  res.send(data);
});

router.get("/log", async (req, res) => {
  const data = await GW2Utils.fetchLog(baseUrl, reqParams);
  const formattedData = GW2Utils.formatLog(data);
  res.send(formattedData);
});

module.exports = router;
