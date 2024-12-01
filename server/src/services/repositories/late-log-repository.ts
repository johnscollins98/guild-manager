import { Service } from 'typedi';
import { ILike } from 'typeorm';
import { dataSource } from '../../dataSource';
import { LateLog } from '../../models/late-log.model';
import { BaseRepository } from './base-repository';

@Service()
export default class LateLogRepository extends BaseRepository<LateLog> {
  constructor() {
    super(dataSource.getRepository(LateLog));
  }

  async getForMember(memberId: string): Promise<LateLog[]> {
    return await this.repo.find({ where: { givenTo: memberId } });
  }

  async getAllWhereGivenToIncludes(str: string | undefined | null): Promise<LateLog[]> {
    return await this.getAll({ where: { givenTo: str ? ILike(`%${str}%`) : undefined } });
  }
}
