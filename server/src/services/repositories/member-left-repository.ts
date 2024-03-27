import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MemberLeft } from '../../models/member-left.model';
import { BaseRepository } from './base-repository';

@Service()
export class MemberLeftRepository extends BaseRepository<MemberLeft> {
  constructor(@InjectRepository(MemberLeft) repo: Repository<MemberLeft>) {
    super(repo);
  }
}
