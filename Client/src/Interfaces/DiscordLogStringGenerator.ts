export interface DiscordLogDisplay {
  summary: string;
  details?: string[];
}

export interface DiscordLogDisplayGenerator {
  getEntry(): DiscordLogDisplay;
}
