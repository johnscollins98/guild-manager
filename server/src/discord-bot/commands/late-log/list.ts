import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import LateLogRepository from '../../../services/repositories/late-log-repository';
import { Command } from '../../command-factory';

@Service()
export default class LateLogListCommand implements Command {
  public readonly name: string;
  constructor(private readonly lateLogRepo: LateLogRepository) {
    this.name = 'latelog-list';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('List all late log entries')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Filter by user given to')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const memberId = interaction.options.getUser('given-to-user');

    const lateLogEntries = await this.lateLogRepo.getAllWhereGivenToIncludes(memberId?.id);

    interaction.editReply({
      content:
        lateLogEntries
          .map(
            e =>
              `* <@${e.givenTo}> logged by <@${e.givenBy}> on <t:${Math.floor(e.timestamp.valueOf() / 1000)}:d>. Notified: **${e.notification}**`
          )
          .join('\n') || 'There are no late log entries.'
    });
  }
}
