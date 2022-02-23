import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Warning } from '../models/warning.model';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseRepository } from './base.repository';
@Service()
class WarningsRepository extends BaseRepository<Warning> {
  constructor(@InjectRepository(Warning) repo: Repository<Warning>) {
    super(repo);
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await this.repo.find({ givenTo: memberId });
  }

  
}

export default WarningsRepository;