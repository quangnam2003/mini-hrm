export interface SelectedEmployee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserAPIResponse {
  id: string;
  empCode?: string;
  name: string;
  shortName: string;
  avatar?: string;
  email: string;
}

export interface PermissionAPIResponse {
  id: string;
  name: string;
  code: string;
  users: UserAPIResponse[];
}

export interface PermissionUserBE {
  id: number;
  empCode?: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface PermissionBE {
  id: number;
  key: string;
  label: string;
  description: string;
  users: PermissionUserBE[];
}

export interface ModuleBE {
  module: string;
  module_name: string;
  permissions: PermissionBE[];
}

export type AllPermissionsResponseBE = Record<string, ModuleBE>;

export interface ModuleAPIResponse {
  id: string;
  name: string;
  permissions: PermissionAPIResponse[];
}

export interface EmployeeSearchResult {
  id: string;
  name: string;
  email: string;
}

export interface PermissionAssignPayload {
  permission_id: number;
  user_ids: number[];
}