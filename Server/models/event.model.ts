import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Event {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

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
