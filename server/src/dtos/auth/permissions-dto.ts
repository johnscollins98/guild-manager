export interface PermissionsDTO {
  ACCESS: boolean;
  EVENTS: boolean;
  WARNINGS: boolean;
  RECRUITMENT: boolean;
  MEMBERS: boolean;
}

export type Permission = keyof PermissionsDTO;
