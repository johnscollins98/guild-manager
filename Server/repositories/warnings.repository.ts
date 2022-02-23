import { isValidObjectId } from 'mongoose';
import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import Warning from '../interfaces/warning.interface';
import WarningModel from '../models/warning.model';

@Service()
class WarningsRepository {
  constructor() {}
  async getAll(): Promise<Warning[]> {
    return await WarningModel.find().exec();
  }

  async get(id: string): Promise<Warning | undefined> {
    this.validateId(id);
    return await WarningModel.findById(id).exec() || undefined;
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await WarningModel.find({ givenTo: memberId }).exec();
  }

  async create(newWarning: Warning): Promise<Warning> {
    return await new WarningModel(newWarning).save();
  }

  async delete(id: string): Promise<Warning | undefined> {
    this.validateId(id);
    return await WarningModel.findByIdAndDelete(id) || undefined;
  }

  async update(id: string, updatedWarning: Warning): Promise<Warning | undefined> {
    this.validateId(id);  
    return await WarningModel.findByIdAndUpdate(id, updatedWarning) || undefined;
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new HttpError(400, `Invalid ID: ${id}`);
    }
  }
}

export default WarningsRepository;