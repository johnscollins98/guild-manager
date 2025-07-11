import { REST, Routes } from 'discord.js';
import { config } from '../config';
import { CommandGatherer } from './command-gatherer';

const run = async () => {
  const commandFactory = new CommandGatherer();

  const commands = process.argv.some(a => a === '-c' || a === '--clear')
    ? []
    : (await commandFactory.getCommands()).configs;

  const rest = new REST({});

  if (!config.botToken) {
    throw 'bot token is not defined';
  }

  if (!config.discordClientId) {
    throw 'discord client id is not defined';
  }

  if (!config.discordGuildId) {
    throw 'discord guild id is not defined';
  }

  rest.setToken(config.botToken);

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: commands
  });

  console.log('Success!');
};

run();
