import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../../../config';
import { DiscordController } from '../../../controllers/discord-controller';
import { EventPostSettingsRepository } from '../../../services/repositories/event-post-settings-repository';
import { respond, RespondableInteraction } from '../respond';

@Service()
export class EventPoster {
  constructor(
    private readonly eventSettingsRepo: EventPostSettingsRepository,
    private readonly discordController: DiscordController
  ) {}

  async postEventSequence(interaction: RespondableInteraction, label: string) {
    const settings = await this.eventSettingsRepo.findOrCreateByGuildId(config.discordGuildId);

    if (Object.values(settings).some(v => !v)) {
      await respond(interaction, { content: label, components: [] });
      return;
    }

    const yesBtn = new ButtonBuilder({
      label: 'Yes',
      customId: 'yes',
      style: ButtonStyle.Primary
    });

    const noBtn = new ButtonBuilder({
      label: 'No',
      customId: 'no',
      style: ButtonStyle.Secondary
    });

    const actionRow = new ActionRowBuilder<ButtonBuilder>({ components: [noBtn, yesBtn] });

    const msg = await respond(interaction, {
      content: `${label}\n\nWould you like to update the post in <#${settings.channelId}>`,
      components: [actionRow]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60_000
    });

    if (res.customId === 'yes') {
      await respond(res, { content: 'Posting events...', components: [] });
      await this.discordController.postEventUpdates();
      await res.editReply({ content: 'Updates posted!', components: [] });
    } else {
      await respond(res, { content: label || 'Did not post updates.', components: [] });
    }
  }
}
