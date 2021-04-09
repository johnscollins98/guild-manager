const router = require('express').Router();
const fetch = require('node-fetch');
const DiscordUtils = require('../utils/discord');
const { getUserAuthInfo } = require('../utils/auth');

const baseUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}`;
const botToken = process.env.BOT_TOKEN;
const reqParams = {
  headers: {
    Authorization: `Bot ${botToken}`,
  },
};

router.get('/roles', async (req, res) => {
  const roles = await fetch(`${baseUrl}/roles`, reqParams);
  const rolesData = await roles.json();
  if (roles.status !== 200) {
    res.status(roles.status).json(rolesData);
    return;
  }

  res.status(200).json(
    DiscordUtils.getRoleInfo(
      rolesData,
      rolesData.sort((a, b) => b.position - a.position).map((r) => r.id)
    )
  );
});

router.get('/members', async (req, res) => {
  try {
    // fetch member data
    const members = await fetch(`${baseUrl}/members?limit=1000`, reqParams);
    const membersData = await members.json();
    if (members.status !== 200) {
      res.status(members.status).json(membersData);
      return;
    }

    // fetch role data
    const roles = await fetch(`${baseUrl}/roles`, reqParams);
    const rolesData = await roles.json();
    if (roles.status !== 200) {
      res.status(roles.status).json(rolesData);
      return;
    }

    // format and return
    const data = DiscordUtils.formatMembers(membersData, rolesData);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

router.put('/members/:memberId/roles/:roleId', async (req, res) => {
  const authInfo = await getUserAuthInfo(req);
  if (!authInfo.authorized) return res.status(403).json('Forbidden');

  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'PUT' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:memberId/roles/:roleId', async (req, res) => {
  const authInfo = await getUserAuthInfo(req);
  if (!authInfo.authorized) return res.status(403).json('Forbidden');

  const response = await fetch(
    `${baseUrl}/members/${req.params.memberId}/roles/${req.params.roleId}`,
    { ...reqParams, method: 'DELETE' }
  );
  res.status(response.status).json(req.params.roleId);
});

router.delete('/members/:id', async (req, res) => {
  const authInfo = await getUserAuthInfo(req);
  if (!authInfo.authorized) return res.status(403).json('Forbidden');

  const response = await fetch(`${baseUrl}/members/${req.params.id}`, {
    ...reqParams,
    method: 'DELETE',
  });
  res.status(response.status).json(req.params.id);
});

module.exports = router;
