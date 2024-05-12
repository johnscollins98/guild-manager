import { Service } from 'typedi';
import { dataSource } from '../../dataSource';
import { RecruitmentPost } from '../../models/recruitment-post.model';
import { BaseRepository } from './base-repository';

@Service()
export class RecruitmentPostRepository extends BaseRepository<RecruitmentPost> {
  constructor() {
    super(dataSource.getRepository(RecruitmentPost));
  }
}
