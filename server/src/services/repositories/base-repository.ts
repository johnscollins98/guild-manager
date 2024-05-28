import { Service } from 'typedi';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

interface IMayHaveId {
  id: number;
}

@Service()
export abstract class BaseRepository<T extends IMayHaveId> {
  constructor(protected readonly repo: Repository<T>) {}

  async getAll(where?: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(where);
  }

  async getOne(where: FindOneOptions<T> = { where: {} }): Promise<T | null> {
    return await this.repo.findOne(where);
  }

  async getById(id: number): Promise<T | null> {
    return await this.repo.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async create(newItem: DeepPartial<T>): Promise<T> {
    return await this.repo.save(newItem);
  }

  async delete(id: number): Promise<T | null> {
    const toDelete = await this.getById(id);
    const deleteResult = await this.repo.delete(id);
    if (deleteResult.affected === 1 && toDelete) {
      return toDelete;
    } else {
      return null;
    }
  }

  async update(id: number, updatedItem: QueryDeepPartialEntity<T>): Promise<T | null> {
    await this.repo.update(id, updatedItem);
    return await this.getById(id);
  }
}
