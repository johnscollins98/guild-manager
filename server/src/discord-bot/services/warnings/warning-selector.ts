import { SelectMenuComponentOptionData } from 'discord.js';
import { Service } from 'typedi';
import { WarningTypeLabels } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { EditorHelpers } from '../editor-helpers';
import { respond, RespondableInteraction } from '../respond';

@Service()
export class WarningSelector {
  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    discordApiFactory: DiscordApiFactory,
    private readonly editorHelpers: EditorHelpers,
    private readonly warningsRepo: WarningsRepository
  ) {
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async selectWarning(interaction: RespondableInteraction, userId?: string) {
    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(userId);

    const warningsSorted = warnings.sort(
      (a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()
    );

    const discordUsers = await this.discordGuildApi.getMembers();

    if (warningsSorted.length === 0) {
      await respond(interaction, { content: 'There are no warnings.' });
      return;
    }

    const warningOptions: SelectMenuComponentOptionData[] = warningsSorted.map(warning => {
      const discordUser = discordUsers.find(u => u.user?.id === warning.givenTo);
      const username =
        discordUser?.nick ??
        discordUser?.user?.global_name ??
        discordUser?.user?.username ??
        'Unknown User';

      return {
        label: warning.reason.substring(0, 50),
        description: `Given to ${username} on ${new Date(warning.timestamp).toDateString()} (${WarningTypeLabels[warning.type]})`,
        value: warning.id.toString()
      };
    });

    return await this.editorHelpers.fetchFromList(
      interaction,
      warningOptions,
      'warning-id',
      'Please select a warning.'
    );
  }
}
