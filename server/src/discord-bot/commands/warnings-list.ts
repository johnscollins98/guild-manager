import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandStringOption
} from 'discord.js';
import { Service } from 'typedi';
import { ILike } from 'typeorm';
import WarningsRepository from '../../services/repositories/warnings-repository';
import { Command } from '../command-factory';

@Service()
export class WarningsListCommand implements Command {
  public readonly name: string;
  constructor(private readonly warningsRepo: WarningsRepository) {
    this.name = 'warnings-list';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('See warnings')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(
        new SlashCommandStringOption()
          .setName('gw2-account-name')
          .setDescription('Filter warnings by account name (including numbers)')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const memberId = interaction.options.getString('gw2-account-name') ?? undefined;

    const warnings = await this.warningsRepo.getAll({
      where: { givenTo: memberId && ILike(`%${memberId}%`) }
    });

    interaction.editReply({
      content:
        warnings
          .map(
            w =>
              `* "${w.reason}"\n\tGiven to **${w.givenTo}** by **${w.givenBy}** on <t:${Math.floor(w.timestamp.valueOf() / 1000)}:d>`
          )
          .join('\n') || 'There are no warnings.'
    });
  }
}
