import { Service } from 'typedi';
import { Warning } from '../../models/warning.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';
@Service()
class WarningsRepository extends BaseRepository<Warning> {
  constructor() {
    super(dataSource.getRepository(Warning));
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await this.repo.find({ where: { givenTo: memberId } });
  }
}

export default WarningsRepository;
