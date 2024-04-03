import { Column, Entity, ObjectId, ObjectIdColumn, PrimaryColumn } from 'typeorm';

export interface MessageIDs {
  [key: string]: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  Dynamic: string;
}

@Entity()
export class EventPostSettings {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

  @PrimaryColumn()
  guildId!: string;

  @Column()
  channelId!: string;

  @Column()
  editMessages!: boolean;

  @Column()
  existingMessageIds!: MessageIDs;
}
