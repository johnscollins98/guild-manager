import { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from 'discord.js';
import { glob } from 'glob';
import Container, { Service } from 'typedi';
import { Permission } from '../dtos';
import { AuthService } from '../services/auth/auth-service';

export interface Command {
  name: string;
  getConfig(): Promise<ApplicationCommandDataResolvable>;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  getRequiredPermissions(): Permission[];
}

@Service()
export class CommandFactory {
  private readonly commandMap: Record<string, Command> = {};

  constructor(private readonly authService: AuthService) {}

  async getCommands(): Promise<ApplicationCommandDataResolvable[]> {
    const files = await glob('commands/**/*.{ts,js}', {
      ignore: 'node_modules/**',
      dotRelative: true,
      cwd: __dirname
    });

    for (const file of files) {
      const Command = await import(file);
      const command = Container.get(Command.default) as Command;
      this.commandMap[command.name] = command;
    }

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

    const permissions = command.getRequiredPermissions();
    const authenticated = await this.authService.checkPermissionsWithId(
      interaction.user.id,
      permissions
    );

    if (!authenticated) {
      interaction.editReply({
        content: `You do not have permission to run this command.`
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      interaction.editReply('Something went wrong. Please try again.');
    }
  }
}
