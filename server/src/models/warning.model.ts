import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum WarningType {
  OFFICIAL = 'official',
  INFORMAL = 'informal',
  EVENT = 'event'
}

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

  // Default is only temporary for the transition
  @Column({ type: 'enum', enum: WarningType })
  type!: WarningType;
}
