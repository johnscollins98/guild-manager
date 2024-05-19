import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MemberAssociation {
  @PrimaryColumn({ unique: true })
  gw2AccountName!: string;

  @Column()
  discordAccountId!: string;
}
