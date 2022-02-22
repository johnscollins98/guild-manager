import { isValidObjectId } from 'mongoose';
import IWarningRepository from '../interfaces/IWarningRepository';
import Warning from '../interfaces/Warning';
import WarningModel from '../models/warnings';

class WarningsRepository implements IWarningRepository {
  constructor() {}
  async getAll(): Promise<Warning[]> {
    return await WarningModel.find().exec();
  }

  async get(id: string): Promise<Warning | null> {
    this.validateId(id);
    return await WarningModel.findById(id).exec();
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await WarningModel.find({ givenTo: memberId }).exec();
  }

  async create(newWarning: Warning): Promise<Warning> {
    return await new WarningModel(newWarning).save();
  }

  async delete(id: string): Promise<Warning | null> {
    this.validateId(id);
    return await WarningModel.findByIdAndDelete(id);
  }

  async update(id: string, updatedWarning: Warning): Promise<Warning | null> {
    this.validateId(id);  
    return await WarningModel.findByIdAndUpdate(id, updatedWarning);
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new Error(`Invalid ID: ${id}`);
    }
  }
}

export default WarningsRepository;