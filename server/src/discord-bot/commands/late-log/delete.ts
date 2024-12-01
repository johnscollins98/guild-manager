import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandUserOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import LateLogRepository from '../../../services/repositories/late-log-repository';
import { Command } from '../../command-factory';

@Service()
export default class LateLogDeleteCommand implements Command {
  public readonly name: string;

  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly lateLogRepo: LateLogRepository,
    discordApiFactory: DiscordApiFactory
  ) {
    this.name = 'latelog-delete';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Delete a late log enetry')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Optionally filter options by user given to')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const givenToUser = interaction.options.getUser('given-to-user');
    const entries = await this.lateLogRepo.getAllWhereGivenToIncludes(givenToUser?.id);

    const discordUsers = await this.discordGuildApi.getMembers();

    if (entries.length === 0) {
      interaction.editReply('There are no entries to delete');
      return;
    }

    const entryOptions = entries.map(logEntry => {
      const discordUser = discordUsers.find(u => u.user?.id === logEntry.givenTo);
      const username =
        discordUser?.nick ??
        discordUser?.user?.global_name ??
        discordUser?.user?.username ??
        'Unknown User';

      return new StringSelectMenuOptionBuilder()
        .setLabel(username)
        .setDescription(`${new Date(logEntry.timestamp).toDateString()}`)
        .setValue(`${logEntry.id}`);
    });

    const entrySelectMenu = new StringSelectMenuBuilder()
      .setCustomId('entry-id')
      .setPlaceholder('Select an entry to delete')
      .addOptions(entryOptions);

    const entryAction = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      entrySelectMenu
    );

    const response = await interaction.editReply({
      content: 'Please select an entry to delete',
      components: [entryAction]
    });

    try {
      const reply = await response.awaitMessageComponent({ time: 60_000 });

      if (!('values' in reply)) {
        throw new Error('No values in reply.');
      }

      const entryId = reply.values[0];
      if (!entryId) {
        throw new Error('No entry id provided.');
      }

      const deleted = await this.lateLogRepo.delete(parseInt(entryId));

      if (deleted) {
        reply.update({ content: 'Successfully deleted entry.', components: [] });
      } else {
        reply.update({ content: 'Failed to delete entry, please try again.', components: [] });
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
