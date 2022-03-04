import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn } from 'typeorm';

export interface MessageIDs {
  [key: string]: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

@Entity()
export class EventPostSettings {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @PrimaryColumn()
  guildId!: string;

  @Column()
  channelId!: string;

  @Column()
  editMessages!: boolean;

  @Column()
  existingMessageIds!: MessageIDs;
}
