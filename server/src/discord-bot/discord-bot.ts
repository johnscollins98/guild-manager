import { AuditLogEvent, Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../config';
import { MemberLeftRepository } from '../services/repositories/member-left-repository';
import { CommandFactory } from './command-factory';

@Service()
export class DiscordBot {
  private readonly client: Client;

  constructor(
    private readonly memberLeftRepository: MemberLeftRepository,
    private readonly commandFactory: CommandFactory
  ) {
    this.client = new Client({
      intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
      partials: [Partials.GuildMember]
    });
  }

  async init() {
    this.client.on('ready', async () => {
      console.log('Bot listening');
      await this.setupEventListeners();
      console.log('Setup event listeners');
    });
    await this.login();
  }

  async login() {
    await this.client.login(config.botToken);
  }

  async tidyup() {
    const guild = this.client.guilds.resolve(config.discordGuildId);
    if (guild) {
      console.log('Deleting commands.');
      await guild.commands.set([]);
      console.log('Done deleting commands.');
    }
  }

  async setupCommands() {
    const guild = this.client.guilds.resolve(config.discordGuildId);

    if (!guild) throw new Error('Guild not available');

    await guild.commands.set([]);

    const commands = await this.commandFactory.getCommands();
    await guild.commands.set(commands);
  }

  private async setupEventListeners() {
    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;
      if (!interaction.command) return;

      this.commandFactory.executeCommandByName(interaction.command.name, interaction);
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
