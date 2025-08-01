import { RecruitmentPostCreateDTO, RecruitmentPostDTO } from '../../dtos';
import { User } from './user';

export interface IRecruitmentPostController {
  get(): Promise<RecruitmentPostDTO | null>;
  getGeneratedPost(isHtml: boolean): Promise<string | null>;
  upsert(body: RecruitmentPostCreateDTO, user?: User): Promise<RecruitmentPostDTO>;
  delete(): Promise<void>;
}
