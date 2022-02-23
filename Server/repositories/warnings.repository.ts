import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Warning } from '../models/warning.model';
import { InjectRepository } from 'typeorm-typedi-extensions';
@Service()
class WarningsRepository {
  constructor(@InjectRepository(Warning) private readonly warningRepo: Repository<Warning>) {}

  async getAll(): Promise<Warning[]> {
    return await this.warningRepo.find();
  }

  async get(id: string): Promise<Warning | undefined> {
    return await this.warningRepo.findOne(id);
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await this.warningRepo.find({ givenTo: memberId });
  }

  async create(newWarning: Warning): Promise<Warning> {
    return await this.warningRepo.save(newWarning);
  }

  async delete(id: string): Promise<Warning | undefined> {
    const warningToDelete = await this.warningRepo.findOne(id);
    const deleteResult = await this.warningRepo.delete(id);
    if (deleteResult.affected === 1 && warningToDelete) {
      return warningToDelete;
    } else {
      return undefined;
    }
  }

  async update(id: string, updatedWarning: Warning): Promise<Warning | undefined> {
    const updateResult = await this.warningRepo.update(id, updatedWarning);
    if (updateResult.affected === 1) {
      return await this.warningRepo.findOne(id);
    } else {
      return undefined;
    }
  }
}

export default WarningsRepository;