import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class RecruitmentPost {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

  @Column()
  content!: string;
}
