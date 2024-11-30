import { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from 'discord.js';
import { Service } from 'typedi';
import { EventsCreateCommand } from './commands/events-create';
import { EventsListCommand } from './commands/events-list';
import { WarningsDeleteCommand } from './commands/warnings-delete';
import { WarningsGiveCommand } from './commands/warnings-give';
import { WarningsListCommand } from './commands/warnings-list';

export interface Command {
  name: string;
  getConfig(): Promise<ApplicationCommandDataResolvable>;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

@Service()
export class CommandFactory {
  private readonly commandMap: Record<string, Command>;

  constructor(
    warningsListCommand: WarningsListCommand,
    warningsGiveCommand: WarningsGiveCommand,
    warningsDeleteCommand: WarningsDeleteCommand,
    eventsListCommand: EventsListCommand,
    eventsCreateCommand: EventsCreateCommand
  ) {
    // Todo - is there a more "automated" way to achieve this?
    this.commandMap = [
      warningsListCommand,
      warningsGiveCommand,
      warningsDeleteCommand,
      eventsListCommand,
      eventsCreateCommand
    ].reduce((map, command) => ({ ...map, [command.name]: command }), {});
  }

  async getCommandConfigs(): Promise<ApplicationCommandDataResolvable[]> {
    const promises = Object.values(this.commandMap).map(command => command.getConfig());
    return await Promise.all(promises);
  }

  async executeCommandByName(name: string, interaction: ChatInputCommandInteraction) {
    const command = this.commandMap[name];

    if (!command) {
      interaction.reply({ content: `The command ${name} was not recognised.`, ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      interaction.editReply('Something went wrong. Please try again.');
    }
  }
}
