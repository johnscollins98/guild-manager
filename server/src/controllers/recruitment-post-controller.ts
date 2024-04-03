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
import { RecruitmentPost } from '../models/recruitment-post.model';
import { PostGeneratorFactory } from '../services/recruitment/post-generator-factory';
import { RecruitmentPostRepository } from '../services/repositories/recruitment-post-repository';

@JsonController('/api/recruitment-post', { transformResponse: false })
@Authorized()
@Service()
export class RecruitmentPostController {
  constructor(
    private readonly recruitmentRepo: RecruitmentPostRepository,
    private readonly postGeneratorFactory: PostGeneratorFactory
  ) {}

  @Get('/')
  @OnNull(404)
  get(): Promise<RecruitmentPost | null> {
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
  async upsert(@Body() body: RecruitmentPost) {
    const post = await this.recruitmentRepo.getOne();

    if (post) {
      await this.recruitmentRepo.update(post._id, body);
      return this.recruitmentRepo.getById(post._id);
    } else {
      return this.recruitmentRepo.create(body);
    }
  }

  @Delete('/')
  @OnUndefined(204)
  async delete() {
    const post = await this.recruitmentRepo.getOne();

    if (!post) {
      throw new NotFoundError();
    }

    await this.recruitmentRepo.delete(post._id);
  }
}
