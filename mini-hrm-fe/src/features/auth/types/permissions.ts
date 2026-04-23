export interface PermissionItem {
  id: number;
  key: string;
  action: string;
  description: string;
}

export interface PermissionResponse {
  data: PermissionItem[];
}
