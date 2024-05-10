import { RecruitmentPostCreateDTO, RecruitmentPostDTO } from '../../dtos';

export interface IRecruitmentPostController {
  get(): Promise<RecruitmentPostDTO | null>;
  getGeneratedPost(isHtml: boolean): Promise<string | null>;
  upsert(body: RecruitmentPostCreateDTO): Promise<RecruitmentPostDTO>;
  delete(): Promise<void>;
}
