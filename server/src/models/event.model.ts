import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DayOfWeek } from '../dtos';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  day!: DayOfWeek;

  @Column()
  startTime!: string;

  @Column()
  duration!: string;

  @Column()
  leaderId!: string;
}
