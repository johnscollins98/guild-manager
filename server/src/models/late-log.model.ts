import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LateLogNotification } from '../dtos/late-log';

@Entity()
export class LateLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  givenBy!: string;

  @Column()
  givenTo!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column()
  notification!: LateLogNotification;
}
