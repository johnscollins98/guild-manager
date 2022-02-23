import { Service } from 'typedi';
import { DeepPartial, Repository } from 'typeorm';

@Service()
export abstract class BaseRepository<T> {
  constructor(protected readonly repo: Repository<T>) {}

  async getAll(): Promise<T[]> {
    return await this.repo.find();
  }

  async getById(id: string): Promise<T | undefined> {
    return await this.repo.findOne(id);
  }

  async create(newItem: DeepPartial<T>): Promise<T> {
    return await this.repo.save(newItem);
  }

  async delete(id: string): Promise<T | undefined> {
    const toDelete = await this.repo.findOne(id);
    const deleteResult = await this.repo.delete(id);
    if (deleteResult.affected === 1 && toDelete) {
      return toDelete;
    } else {
      return undefined;
    }
  }

  async update(id: string, updatedItem: T): Promise<T | undefined> {
    const updateResult = await this.repo.update(id, updatedItem);
    if (updateResult.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      return undefined;
    }
  }
} 