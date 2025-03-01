import Container from 'typedi';
import { DiscordBot } from './discord-bot';

const bot = Container.get(DiscordBot);
bot.login().then(() => bot.setupCommands().then(() => process.exit()));
