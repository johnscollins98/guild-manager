const router = require("express").Router();
const fetch = require("node-fetch");
const GW2Utils = require("../utils/gw2");

const baseUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
const apiToken = process.env.GW2_API_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bearer ${apiToken}`,
  },
};

router.get("/members", async (req, res) => {
  try {
    const response = await fetch(`${baseUrl}/members`, reqParams);
    const data = await response.json();

    // unique cases for crazy account names 
    const uniqueCase = data.find(m => m.name === "DD035413-353B-42A1-BAD4-EB58438860CE")
    if (uniqueCase) uniqueCase.name = "Berry";

    res.status(response.status).json(data);
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
});

router.get("/log", async (req, res) => {
  try {
    const response = await fetch(`${baseUrl}/log`, reqParams);
    const status = response.status;
    const data = await response.json();
    if (status === 200) {
      res.status(200).json(GW2Utils.formatLog(data));
    } else {
      res.status(status).json(data);
    }
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
});

module.exports = router;
