import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RecruitmentPost } from '../../models/recruitment-post.model';
import { EventTableGenerator } from './event-table-generator';
import { PostGenerator } from './post-generator';

@Service()
export class MdPostGenerator implements PostGenerator {
  constructor(
    @InjectRepository(RecruitmentPost)
    private readonly recruitmentPostRepo: Repository<RecruitmentPost>,
    private readonly eventTableGenerator: EventTableGenerator
  ) {}

  async generateRecruitmentPost(): Promise<string | undefined> {
    const post = await this.recruitmentPostRepo.findOne();

    if (!post) {
      return undefined;
    }

    return post.content.replace(
      '{eventTable}',
      await this.eventTableGenerator.generateEventsTableMd()
    );
  }
}
