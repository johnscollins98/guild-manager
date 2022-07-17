import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @PrimaryColumn()
  id!: string;

  @Column()
  username!: string;

  @Column()
  accessToken!: string;
}
