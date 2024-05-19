import { AssociationDTO, GW2LogEntryDTO, GW2Rank } from '../../dtos';
import { GW2MemberResponseDTO } from '../../dtos/gw2/gw2-member-response-dto';

export interface IGW2Controller {
  getLog(): Promise<GW2LogEntryDTO[]>;
  getMembers(): Promise<GW2MemberResponseDTO[]>;
  getRanks(): Promise<GW2Rank[]>;
  associateToDiscordAccount(associationDto: AssociationDTO): Promise<void>;
}
