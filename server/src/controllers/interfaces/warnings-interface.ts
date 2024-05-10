import { WarningCreateDTO, WarningDTO } from '../../dtos';

export interface IWarningsController {
  getAll(): Promise<WarningDTO[]>;
  get(id: number): Promise<WarningDTO | null>;
  getForMember(id: string): Promise<WarningDTO[]>;
  delete(id: number): Promise<void>;
  create(warning: WarningCreateDTO): Promise<WarningDTO>;
  update(id: number, warning: WarningCreateDTO): Promise<WarningDTO | null>;
}
