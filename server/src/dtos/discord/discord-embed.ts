export interface DiscordEmbed {
  color: number;
  title: string;
  fields: Field[];
}

export interface Field {
  name: string;
  value: string;
}
