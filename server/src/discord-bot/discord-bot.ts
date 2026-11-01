import { AuditLogEvent, Client, Events, Partials } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../config';
import { MemberLeftRepository } from '../services/repositories/member-left-repository';
import { CommandExecutor } from './command-executor';
import { WelcomeMessageHandler } from './services/welcome-message-handler';

@Service()
export class DiscordBot {
  private readonly client: Client;

  constructor(
    private readonly memberLeftRepository: MemberLeftRepository,
    private readonly commandExecutor: CommandExecutor,
    private readonly welcomeMessageHandler: WelcomeMessageHandler
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
      await this.welcomeMessageHandler.handleInteraction(interaction);
      if (!interaction.isChatInputCommand()) return;

      this.commandExecutor.executeCommandByName(interaction.commandName, interaction);
    });
  }

  private async setupEventListeners() {
    this.client.on('messageCreate', message => this.welcomeMessageHandler.handle(message));
    this.client.on(Events.GuildMemberAdd, member =>
      this.welcomeMessageHandler.handleMemberJoin(member)
    );

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

      if (config.leaversChannelId) {
        const leaversChannel = await this.client.channels.fetch(config.leaversChannelId);
        if (leaversChannel && leaversChannel.isSendable()) {
          leaversChannel.send({
            content: `**${m.displayName}** left the server :(`
          });
        }
      }

      console.log(`Logging ${m.displayName} left`);
      this.memberLeftRepository.create({
        displayName: m.displayName,
        nickname: m.nickname ?? undefined,
        username: m.user.username,
        userId: m.user.id,
        userDisplayName: m.user.displayName,
        globalName: m.user.globalName ?? undefined,
        time: new Date()
      });
    });
  }
}
