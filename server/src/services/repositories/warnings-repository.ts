import { Service } from 'typedi';
import { ILike } from 'typeorm';
import { dataSource } from '../../dataSource';
import { Warning } from '../../models/warning.model';
import { BaseRepository } from './base-repository';
@Service()
class WarningsRepository extends BaseRepository<Warning> {
  constructor() {
    super(dataSource.getRepository(Warning));
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await this.repo.find({ where: { givenTo: memberId } });
  }

  async getAllWhereGivenToIncludes(str: string | undefined | null): Promise<Warning[]> {
    return await this.getAll({ where: { givenTo: str ? ILike(`%${str}%`) : undefined } });
  }
}

export default WarningsRepository;
