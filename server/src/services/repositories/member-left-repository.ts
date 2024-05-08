import { Service } from 'typedi';
import { MemberLeft } from '../../models/member-left.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';

@Service()
export class MemberLeftRepository extends BaseRepository<MemberLeft> {
  constructor() {
    super(dataSource.getRepository(MemberLeft));
  }
}
