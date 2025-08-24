import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MemberLeft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column()
  displayName!: string;

  @Column()
  userDisplayName!: string;

  @Column({ nullable: true })
  globalName?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  time!: Date;
}
