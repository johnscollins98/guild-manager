import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Action } from '../dtos/audit-log/action';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  timestamp!: Date;

  @Column()
  sourceUserId!: string;

  @Column()
  sourceUsername!: string; // backup if they're not longer accessible

  @Column({ nullable: true })
  targetUserId?: string; // discord user id

  @Column({ nullable: true })
  targetUsername?: string; // backup if they're no longer accessible

  @Column({ nullable: true })
  eventId?: number;

  @Column({ nullable: true })
  warningId?: number;

  @Column({ nullable: true })
  roleId?: string;

  @Column({ nullable: true })
  gw2AccountName?: string;

  @Column({ nullable: true })
  nick?: string;

  @Column()
  action!: Action;
}
