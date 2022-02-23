import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Warning {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @Column()
  reason!: string;

  @Column()
  givenBy!: string;

  @Column()
  givenTo!: string;

  @CreateDateColumn()
  timestamp!: Date;
}