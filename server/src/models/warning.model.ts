import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { WarningType } from '../dtos';

@Entity()
export class Warning {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  reason!: string;

  @Column()
  givenBy!: string;

  @Column()
  givenTo!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @UpdateDateColumn()
  lastUpdatedTimestamp!: Date;

  @Column({ nullable: true, default: null })
  lastUpdatedBy?: string;

  // Default is only temporary for the transition
  @Column({ type: 'enum', enum: WarningType })
  type!: WarningType;
}
