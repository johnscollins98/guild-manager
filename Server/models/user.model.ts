import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @Column()
  id!: string;

  @Column()
  username!: string;
}