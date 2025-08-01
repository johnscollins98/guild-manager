import { WarningCreateDTO, WarningDTO } from '../../dtos';
import { User } from './user';

export interface IWarningsController {
  getAll(): Promise<WarningDTO[]>;
  get(id: number): Promise<WarningDTO | null>;
  getForMember(id: string): Promise<WarningDTO[]>;
  delete(id: number, user?: User): Promise<void>;
  create(warning: WarningCreateDTO, user?: User): Promise<WarningDTO>;
  update(id: number, warning: WarningCreateDTO, user?: User): Promise<WarningDTO | null>;
}
