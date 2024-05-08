import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RecruitmentPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;
}
