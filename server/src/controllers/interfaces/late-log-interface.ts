import { LateLogCreateDto } from '../../dtos';
import { LateLogDto } from '../../dtos/late-log/late-log-dto';

export interface ILateLogController {
  getAll(): Promise<LateLogDto[]>;
  create(createDto: LateLogCreateDto): Promise<LateLogDto>;
  delete(id: number): Promise<void>;
}
