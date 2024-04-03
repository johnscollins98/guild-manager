import { Service } from 'typedi';
import { RecruitmentPostRepository } from '../repositories/recruitment-post-repository';
import { EventTableGenerator } from './event-table-generator';
import { PostGenerator } from './post-generator';

@Service()
export class MdPostGenerator implements PostGenerator {
  constructor(
    private readonly recruitmentPostRepo: RecruitmentPostRepository,
    private readonly eventTableGenerator: EventTableGenerator
  ) {}

  async generateRecruitmentPost(): Promise<string | null> {
    const post = await this.recruitmentPostRepo.getOne();

    if (!post) {
      return null;
    }

    return post.content.replace(
      '{eventTable}',
      await this.eventTableGenerator.generateEventsTableMd()
    );
  }
}
