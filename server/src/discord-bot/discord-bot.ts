import { AuditLogEvent, Client, Events, Partials } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../config';
import { DiscordController } from '../controllers/discord-controller';
import { MemberLeftRepository } from '../services/repositories/member-left-repository';
import { CommandExecutor } from './command-executor';

@Service()
export class DiscordBot {
  private readonly client: Client;

  constructor(
    private readonly memberLeftRepository: MemberLeftRepository,
    private readonly commandExecutor: CommandExecutor,
    private readonly discordController: DiscordController
  ) {
    this.client = new Client({
      intents: ['GuildPresences', 'GuildMembers', 'Guilds', 'MessageContent', 'GuildMessages'],
      partials: [Partials.GuildMember]
    });
  }

  async init() {
    this.client.on('ready', async () => {
      console.log('Bot listening');
      await this.setupEventListeners();
      console.log('Setup event listeners');
      await this.setupCommands();
      console.log('Setup commands');
    });

    await this.client.login(config.botToken);
  }

  private async setupCommands() {
    await this.commandExecutor.init();

    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;

      this.commandExecutor.executeCommandByName(interaction.commandName, interaction);
    });
  }

  private async setupEventListeners() {
    this.client.on('messageCreate', async e => {
      if (!config.discordGuildId || e.guildId !== config.discordGuildId) return;
      if (!config.welcomeChannelId || e.channelId !== config.welcomeChannelId) return;
      if (e.member?.user.bot) return;

      // only respond if matches <text>.#### format
      const match = new RegExp(/.*\.\d\d\d\d/gm).exec(e.content);
      if (!match) return;

      const memberRoles = e.member?.roles;
      if (!memberRoles) return;

      // get valid roles
      const validRoles = await this.discordController.getRoles();
      const validRoleIds = validRoles.map(r => r.id);

      // only respond if they have no "valid" roles (i.e. uninvited etc)
      if (memberRoles.cache.hasAny(...validRoleIds)) {
        return;
      }

      e.reply(
        `Thanks! ${config.recruitmentRoleId ? `A <@&${config.recruitmentRoleId}>` : 'We'} will get you invited in-game ASAP and keep you updated.`
      );

      if (config.pendingRoleId) {
        e.member.roles.add(config.pendingRoleId);
      }
    });

    // Will refactor if we add more event listeners
    this.client.on('guildMemberRemove', async m => {
      const guild = await this.client.guilds.fetch(config.discordGuildId);
      const logs = await guild.fetchAuditLogs();

      const logsHaveAKickForMember = logs.entries.some(log => {
        const isKick = log.action === AuditLogEvent.MemberKick;
        const isMember = log.targetId === m.user.id;
        return isKick && isMember;
      });

      if (logsHaveAKickForMember) {
        console.log(`${m.displayName} appears to have been kicked, not storing`);
        return;
      }

      console.log(`Logging ${m.displayName} left`);
      this.memberLeftRepository.create({
        displayName: m.displayName,
        nickname: m.nickname ?? undefined,
        username: m.user.username,
        userDisplayName: m.user.displayName,
        globalName: m.user.globalName ?? undefined,
        time: new Date()
      });
    });
  }
}
