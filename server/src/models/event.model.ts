import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  day!: string;

  @Column()
  startTime!: string;

  @Column()
  duration!: string;

  @Column()
  leaderId!: string;
}
