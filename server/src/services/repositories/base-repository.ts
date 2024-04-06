import { ObjectId } from 'mongodb';
import { Service } from 'typedi';
import { DeepPartial, MongoRepository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

interface IMayHaveId {
  _id: ObjectId;
}

@Service()
export abstract class BaseRepository<T extends IMayHaveId> {
  constructor(protected readonly repo: MongoRepository<T>) {}

  async getAll(): Promise<T[]> {
    return await this.repo.find();
  }

  async getOne(): Promise<T | null> {
    return await this.repo.findOne({ where: {} });
  }

  async getById(id: string | ObjectId): Promise<T | null> {
    return await this.repo.findOne({ where: { _id: new ObjectId(id) } });
  }

  async create(newItem: DeepPartial<T>): Promise<T> {
    return await this.repo.save(newItem);
  }

  async delete(id: string | ObjectId): Promise<T | null> {
    const toDelete = await this.getById(id);
    const deleteResult = await this.repo.delete(id);
    if (deleteResult.affected === 1 && toDelete) {
      return toDelete;
    } else {
      return null;
    }
  }

  async update(id: string | ObjectId, updatedItem: QueryDeepPartialEntity<T>): Promise<T | null> {
    // MongoDB limitation if you try to update with the _id - so just strip it out.
    if ('_id' in updatedItem) {
      delete updatedItem._id;
    }

    await this.repo.update(id, updatedItem);
    return await this.getById(id);
  }
}
