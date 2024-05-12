import { Service } from 'typedi';
import { dataSource } from '../../dataSource';
import { MemberLeft } from '../../models/member-left.model';
import { BaseRepository } from './base-repository';

@Service()
export class MemberLeftRepository extends BaseRepository<MemberLeft> {
  constructor() {
    super(dataSource.getRepository(MemberLeft));
  }
}
