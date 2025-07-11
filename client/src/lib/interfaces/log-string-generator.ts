export interface LogDisplay {
  summary: string;
  details?: string[];
}

export interface LogDisplayGenerator {
  getEntry(): LogDisplay;
}
