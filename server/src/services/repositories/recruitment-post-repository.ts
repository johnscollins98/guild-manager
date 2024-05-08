import { Service } from 'typedi';
import { RecruitmentPost } from '../../models/recruitment-post.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';

@Service()
export class RecruitmentPostRepository extends BaseRepository<RecruitmentPost> {
  constructor() {
    super(dataSource.getRepository(RecruitmentPost));
  }
}
