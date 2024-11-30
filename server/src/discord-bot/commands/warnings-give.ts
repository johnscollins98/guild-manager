import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import WarningsRepository from '../../services/repositories/warnings-repository';
import { Command } from '../command-factory';

@Service()
export class WarningsGiveCommand implements Command {
  public readonly name: string;

  constructor(private readonly warningsRepo: WarningsRepository) {
    this.name = 'warnings-give';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Give warning to user')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('user')
          .setDescription('Warning recipient')
          .setRequired(true)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('reason')
          .setDescription('Reason for warning')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    await this.warningsRepo.create({
      givenTo: user.id,
      reason: reason,
      givenBy: interaction.user.id
    });

    interaction.editReply(`Logged a warning for <@${user.id}> with reason: **${reason}**`);
  }
}
