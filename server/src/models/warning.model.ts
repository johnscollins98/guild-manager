import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class Warning {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

  @Column()
  reason!: string;

  @Column()
  givenBy!: string;

  @Column()
  givenTo!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
