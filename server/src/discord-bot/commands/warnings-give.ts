import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandStringOption
} from 'discord.js';
import { Service } from 'typedi';
import { GW2GuildApi } from '../../services/gw2/guild-api';
import WarningsRepository from '../../services/repositories/warnings-repository';
import { Command } from '../command-factory';

@Service()
export class WarningsGiveCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly gw2GuildApi: GW2GuildApi
  ) {
    this.name = 'warnings-give';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Give warning to user')
      .addStringOption(
        new SlashCommandStringOption()
          .setName('gw2-account-id')
          .setDescription('GW2 Account Id')
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
    const memberId = interaction.options.getString('gw2-account-id', true);
    const reason = interaction.options.getString('reason', true);

    const members = await this.gw2GuildApi.getMembers();
    const matchingMember = members.find(m => m.name === memberId);

    if (!matchingMember) {
      interaction.editReply(`Member **${memberId}** does not exist.`);
      return;
    }

    await this.warningsRepo.create({
      givenTo: memberId,
      reason: reason,
      givenBy: interaction.user.username
    });

    interaction.editReply(`Logged a warning for **${memberId}** with reason: **${reason}**`);
  }
}
