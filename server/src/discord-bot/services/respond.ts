import {
  BaseInteraction,
  BaseMessageOptions,
  MessageComponentInteraction,
  RepliableInteraction
} from 'discord.js';

export type RespondableInteraction =
  | RepliableInteraction
  | (BaseInteraction & { update: MessageComponentInteraction['update'] });

export async function respond(interaction: RespondableInteraction, content: BaseMessageOptions) {
  if ('update' in interaction) {
    return await interaction.update(content);
  }

  if (interaction.deferred || interaction.replied) {
    return await interaction.editReply(content);
  }

  return await interaction.reply(content);
}
