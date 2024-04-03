import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class MemberLeft {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

  @Column()
  username!: string;

  @Column()
  nickname?: string;

  @Column()
  displayName!: string;

  @Column()
  userDisplayName!: string;

  @Column()
  globalName?: string;

  @Column()
  time!: Date;
}
