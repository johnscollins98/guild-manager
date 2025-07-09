import { ChatInputCommandInteraction } from 'discord.js';
import { Service } from 'typedi';
import { AuthService } from '../services/auth/auth-service';
import { Command, CommandGatherer } from './command-gatherer';

@Service()
export class CommandExecutor {
  private commandMap: Record<string, Command> = {};

  constructor(
    private readonly authService: AuthService,
    private readonly commandGatherer: CommandGatherer
  ) {}

  async init() {
    this.commandMap = (await this.commandGatherer.getCommands()).commandMap;
  }

  async executeCommandByName(name: string, interaction: ChatInputCommandInteraction) {
    const command = this.commandMap[name];

    if (!command) {
      interaction.reply({
        content: `The command ${name} was not recognised.`,
        ephemeral: true,
        embeds: [],
        components: []
      });
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
      interaction.editReply({
        content: 'Something went wrong. Please try again.',
        components: [],
        embeds: []
      });
    }
  }
}
