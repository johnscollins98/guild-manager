import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandStringOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import WarningsRepository from '../../services/repositories/warnings-repository';
import { Command } from '../command-factory';

@Service()
export class WarningsDeleteCommand implements Command {
  public readonly name: string;

  constructor(private readonly warningsRepo: WarningsRepository) {
    this.name = 'warnings-delete';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Delete a warning')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(
        new SlashCommandStringOption()
          .setName('gw2-account-id')
          .setDescription('Optionally filter options by GW2 account name')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const memberId = interaction.options.getString('gw2-account-id');
    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(memberId);

    if (warnings.length === 0) {
      interaction.editReply('There are no warnings to delete');
      return;
    }

    const warningOptions = warnings.map(warning =>
      new StringSelectMenuOptionBuilder()
        .setLabel(warning.reason)
        .setDescription(
          `Given to ${warning.givenTo} on ${new Date(warning.timestamp).toDateString()}`
        )
        .setValue(`${warning.id}`)
    );

    const warningSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('warning-id')
      .setPlaceholder('Select a warning to delete')
      .addOptions(warningOptions);

    const warningAction = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      warningSelectMenu
    );

    const response = await interaction.editReply({
      content: 'Please select a warning to delete',
      components: [warningAction]
    });

    try {
      const reply = await response.awaitMessageComponent({ time: 60_000 });

      if (!('values' in reply)) {
        throw new Error('No values in reply.');
      }

      const warningId = reply.values[0];
      if (!warningId) {
        throw new Error('No warning id provided.');
      }

      const deleted = await this.warningsRepo.delete(parseInt(warningId));

      if (deleted) {
        reply.update({ content: 'Successfully deleted warning.', components: [] });
      } else {
        reply.update({ content: 'Failed to delete warning, please try again.', components: [] });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply({
        content: 'The command did not complete. Please try again',
        components: []
      });
    }
  }
}
