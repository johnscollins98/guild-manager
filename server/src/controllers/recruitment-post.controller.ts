import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Put,
  QueryParam
} from 'routing-controllers';
import { Service } from 'typedi';
import { RecruitmentPost } from '../models/recruitment-post.model';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PostGeneratorFactory } from '../services/recruitment/post-generator-factory';

@JsonController('/api/recruitment-post', { transformResponse: false })
@Authorized()
@Service()
export class RecruitmentPostController {
  constructor(
    @InjectRepository(RecruitmentPost)
    private readonly recruitmentRepo: Repository<RecruitmentPost>,
    private readonly postGeneratorFactory: PostGeneratorFactory
  ) {}

  @Get('/')
  @OnUndefined(404)
  get() {
    return this.recruitmentRepo.findOne();
  }

  @Get('/generate')
  @OnUndefined(404)
  getGeneratedPost(@QueryParam('html', { type: 'boolean' }) isHtml: boolean) {
    const generator = this.postGeneratorFactory.getPostGenerator(isHtml);
    return generator.generateRecruitmentPost();
  }

  @Put('/')
  async upsert(@Body() body: RecruitmentPost) {
    const post = await this.recruitmentRepo.findOne();

    if (post) {
      await this.recruitmentRepo.update(post._id, body);
      return this.recruitmentRepo.findOne(post._id);
    } else {
      return this.recruitmentRepo.save(body);
    }
  }

  @Delete('/')
  @OnUndefined(204)
  async delete() {
    const post = await this.recruitmentRepo.findOne();

    if (!post) {
      throw new NotFoundError();
    }

    await this.recruitmentRepo.delete(post._id);
  }
}

