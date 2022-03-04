import { Service } from 'typedi';
import { DeepPartial, ObjectID, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

interface IMayHaveId {
  _id?: ObjectID
}

@Service()
export abstract class BaseRepository<T extends IMayHaveId> {
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

  async update(id: string, updatedItem: QueryDeepPartialEntity<T>): Promise<T | undefined> {
    // MongoDB limitation if you try to update with the _id - so just strip it out.
    if (updatedItem.hasOwnProperty('_id')) {
      delete updatedItem._id;
    }

    await this.repo.update(id, updatedItem);
    return await this.repo.findOne(id);
  }
} 