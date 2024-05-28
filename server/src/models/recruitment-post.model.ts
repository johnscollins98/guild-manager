import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RecruitmentPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: '' })
  title!: string;

  @Column()
  content!: string;
}
