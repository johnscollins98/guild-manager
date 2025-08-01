import { Service } from 'typedi';
import { ILike } from 'typeorm';
import { User } from '../../controllers/interfaces/user';
import { dataSource } from '../../dataSource';
import { WarningCreateDTO } from '../../dtos';
import { Warning } from '../../models/warning.model';
import { AuditLogRepository } from './audit-log-repository';
import { BaseRepository } from './base-repository';
@Service()
class WarningsRepository extends BaseRepository<Warning> {
  constructor(private readonly auditLogRepo: AuditLogRepository) {
    super(dataSource.getRepository(Warning));
  }

  async getForMember(memberId: string): Promise<Warning[]> {
    return await this.repo.find({ where: { givenTo: memberId } });
  }

  async getAllWhereGivenToIncludes(str: string | undefined | null): Promise<Warning[]> {
    return await this.getAll({ where: { givenTo: str ? ILike(`%${str}%`) : undefined } });
  }

  async createAndLog(warning: WarningCreateDTO, sourceUser: User) {
    const res = await this.create({ ...warning, givenBy: sourceUser.id });

    if (res) {
      await this.auditLogRepo.logAddWarning(sourceUser, res.givenTo, res.id);
    }

    return res;
  }

  async deleteAndLog(id: number, sourceUser: User) {
    const res = await this.delete(id);

    if (res) {
      this.auditLogRepo.logRemoveWarning(sourceUser, res.givenTo, res.id);
    }

    return res;
  }

  async updateAndLog(id: number, warning: WarningCreateDTO, sourceUser: User) {
    const res = await this.update(id, { ...warning, lastUpdatedBy: sourceUser.id });

    if (res) {
      await this.auditLogRepo.logUpdateWarning(sourceUser, warning.givenTo, id);
    }

    return res;
  }
}

export default WarningsRepository;
