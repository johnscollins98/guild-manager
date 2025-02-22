import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnNull,
  OnUndefined,
  Put,
  QueryParam
} from 'routing-controllers';
import { Service } from 'typedi';
import { RecruitmentPostCreateDTO, RecruitmentPostDTO } from '../dtos';
import { PostGeneratorFactory } from '../services/recruitment/post-generator-factory';
import { RecruitmentPostRepository } from '../services/repositories/recruitment-post-repository';
import { IRecruitmentPostController } from './interfaces';

@JsonController('/api/recruitment-post', { transformResponse: false })
@Authorized()
@Service()
export class RecruitmentPostController implements IRecruitmentPostController {
  constructor(
    private readonly recruitmentRepo: RecruitmentPostRepository,
    private readonly postGeneratorFactory: PostGeneratorFactory
  ) {}

  @Get('/')
  @OnNull(404)
  get(): Promise<RecruitmentPostDTO | null> {
    return this.recruitmentRepo.getOne();
  }

  @Get('/generate')
  @OnNull(404)
  getGeneratedPost(
    @QueryParam('html', { type: 'boolean' }) isHtml: boolean
  ): Promise<string | null> {
    const generator = this.postGeneratorFactory.getPostGenerator(isHtml);
    return generator.generateRecruitmentPost();
  }

  @Put('/')
  @Authorized('RECRUITMENT')
  async upsert(@Body() body: RecruitmentPostCreateDTO): Promise<RecruitmentPostDTO> {
    const post = await this.recruitmentRepo.getOne();

    if (post) {
      await this.recruitmentRepo.update(post.id, body);
      const updatedPost = await this.recruitmentRepo.getById(post.id);
      if (!updatedPost) throw new NotFoundError();
      return updatedPost;
    } else {
      return this.recruitmentRepo.create(body);
    }
  }

  @Delete('/')
  @OnUndefined(204)
  @Authorized('RECRUITMENT')
  async delete(): Promise<void> {
    const post = await this.recruitmentRepo.getOne();

    if (!post) {
      throw new NotFoundError();
    }

    await this.recruitmentRepo.delete(post.id);
  }
}
