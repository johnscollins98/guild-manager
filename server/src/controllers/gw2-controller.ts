import {
  Authorized,
  Body,
  Get,
  Header,
  JsonController,
  OnUndefined,
  Post
} from 'routing-controllers';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AssociationDTO, GW2LogEntryDTO, GW2Rank } from '../dtos';
import { GW2MemberResponseDTO } from '../dtos/gw2/gw2-member-response-dto';
import { MemberAssociation } from '../models/member-association.model';
import { Manager } from '../server';
import { GW2ApiFactory } from '../services/gw2/api-factory';
import { IGW2GuildApi } from '../services/gw2/guild-api';
import { GW2LogFormatter } from '../services/gw2/log-formatter';
import { IGW2Controller } from './interfaces/gw2-interface';

@JsonController('/api/gw2')
@Authorized()
@Service()
export class GW2Controller implements IGW2Controller {
  private readonly gw2GuildApi: IGW2GuildApi;
  private readonly associationRepo: Repository<MemberAssociation>;

  constructor(
    gw2GuildApiFactory: GW2ApiFactory,
    private readonly logFormatter: GW2LogFormatter
  ) {
    this.gw2GuildApi = gw2GuildApiFactory.guildApi();
    this.associationRepo = Manager.getRepository(MemberAssociation);
  }

  @Get('/log')
  async getLog(): Promise<GW2LogEntryDTO[]> {
    const unformattedLog = await this.gw2GuildApi.getLog();
    return this.logFormatter.formatLogEntries(unformattedLog);
  }

  @Get('/members')
  @Header('Cache-control', `public, max-age=0`)
  async getMembers(): Promise<GW2MemberResponseDTO[]> {
    const members = await this.gw2GuildApi.getMembers();

    const membersWithId = await Promise.all(
      members.map(async m => {
        const association = await this.associationRepo.findOneBy({ gw2AccountName: m.name });

        return { ...m, discordId: association?.discordAccountId ?? null };
      })
    );

    return membersWithId;
  }

  @Get('/ranks')
  getRanks(): Promise<GW2Rank[]> {
    return this.gw2GuildApi.getRanks();
  }

  @Post('/association')
  @OnUndefined(204)
  async associateToDiscordAccount(@Body() associationDto: AssociationDTO): Promise<void> {
    await this.associationRepo.save(associationDto);
  }
}
