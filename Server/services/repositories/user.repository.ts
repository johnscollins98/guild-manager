import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { User } from '../../models/user.model';
import { BaseRepository } from './base.repository';

@Service()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectRepository(User) userRepo: Repository<User>) {
    super(userRepo);
  }

  async getByGuildId(guildId: string) : Promise<User | undefined> {
    return await this.repo.findOne({ id: guildId });
  }
}