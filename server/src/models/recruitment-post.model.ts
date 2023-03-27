import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class RecruitmentPost {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @Column()
  content!: string;
}
