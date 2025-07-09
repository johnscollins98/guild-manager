import { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from 'discord.js';
import { glob } from 'glob';
import Container, { Service } from 'typedi';
import { Permission } from '../dtos';

export interface Command {
  name: string;
  getConfig(): Promise<ApplicationCommandDataResolvable>;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  getRequiredPermissions(): Permission[];
}

@Service()
export class CommandGatherer {
  constructor() {}

  async getCommands() {
    const commandMap: Record<string, Command> = {};
    const files = await glob('commands/**/*.{ts,js}', {
      ignore: 'node_modules/**',
      dotRelative: true,
      cwd: __dirname
    });

    for (const file of files) {
      const Command = await import(file);
      const command = Container.get(Command.default) as Command;
      commandMap[command.name] = command;
    }

    const promises = Object.values(commandMap).map(command => command.getConfig());
    const configs = await Promise.all(promises);

    return { configs, commandMap };
  }
}
