export default interface DiscordEmbed {
  color: string;
  title: string;
  fields: Field[];
}

export interface Field {
  name: string;
  value: string;
}