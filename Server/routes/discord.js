const router = require("express").Router();
const DiscordUtils = require("../utils/discord");

const baseUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}`;
const botToken = process.env.BOT_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bot ${botToken}`,
  },
};

router.get("/members", async (req, res) => {
  const members = await DiscordUtils.fetchMembers(baseUrl, reqParams);
  const roles = await DiscordUtils.fetchRoles(baseUrl, reqParams);
  const data = DiscordUtils.formatMembers(members, roles);
  res.send(data);
});

module.exports = router;
