export interface DiscordEmbed {
  color?: number;
  title: string;
  fields?: Field[];
  description?: string;
}

export interface Field {
  name: string;
  value: string;
}
