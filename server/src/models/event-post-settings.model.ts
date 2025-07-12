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
  messageId?: string;
}
