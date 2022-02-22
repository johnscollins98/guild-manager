import Warning from './Warning';

interface IWarningRepository {
  getAll(): Promise<Warning[]>
  get(id: string): Promise<Warning | null>
  getForMember(memberId: string): Promise<Warning[]>
  create(newWarning: Warning): Promise<Warning>
  delete(id: string): Promise<Warning | null>
  update(id: string, updatedWarning: Warning): Promise<Warning | null>
};

export default IWarningRepository;