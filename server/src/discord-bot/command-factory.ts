import { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from 'discord.js';
import { Service } from 'typedi';

export interface Command {
  name: string;
  getConfig(): Promise<ApplicationCommandDataResolvable>;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

@Service()
export class CommandFactory {
  private commandMap: Record<string, Command>;

  constructor() {
    // Todo - is there a more "automated" way to achieve this?
    this.commandMap = {};
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

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: 'Something went wrong. Please try again.', ephemeral: true });
    }
  }
}
