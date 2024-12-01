import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { LateLogNotification, notifications } from '../../../dtos/late-log';
import LateLogRepository from '../../../services/repositories/late-log-repository';
import { Command } from '../../command-factory';

@Service()
export default class LateLogGiveCommand implements Command {
  public readonly name: string;

  constructor(private readonly lateLogRepo: LateLogRepository) {
    this.name = 'latelog-create';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Add entry to late log for user')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('user')
          .setDescription('Late log recipient')
          .setRequired(true)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('notify')
          .setDescription('Did they notify you?')
          .addChoices(Object.values(notifications).map(n => ({ name: n, value: n })))
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const notification = interaction.options.getString('notify', true) as LateLogNotification;

    await this.lateLogRepo.create({
      givenTo: user.id,
      givenBy: interaction.user.id,
      notification: notification
    });

    interaction.editReply(
      `Logged a warning for <@${user.id}> with notification: **${notification}**`
    );
  }
}
