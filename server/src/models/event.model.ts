import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class Event {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

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
