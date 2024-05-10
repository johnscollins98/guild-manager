import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EventPostSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  guildId!: string;

  @Column({ nullable: true })
  channelId?: string;

  @Column({ default: false })
  editMessages!: boolean;

  @Column({ nullable: true })
  Monday?: string;

  @Column({ nullable: true })
  Tuesday?: string;

  @Column({ nullable: true })
  Wednesday?: string;

  @Column({ nullable: true })
  Thursday?: string;

  @Column({ nullable: true })
  Friday?: string;

  @Column({ nullable: true })
  Saturday?: string;

  @Column({ nullable: true })
  Sunday?: string;

  @Column({ nullable: true })
  Dynamic?: string;
}
