import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

export class MessageIDs {
  Monday!: string;
  Tuesday!: string;
  Wednesday!: string;
  Thursday!: string;
  Friday!: string;
  Saturday!: string;
  Sunday!: string;
}

@Entity()
export class EventPostSettings {
  @ObjectIdColumn()
  public readonly _id!: ObjectID;

  @Column()
  guildId!: string;

  @Column()
  channelId!: string;

  @Column()
  editMessages!: boolean;

  @Column()
  existingMessageIds!: MessageIDs;
}
