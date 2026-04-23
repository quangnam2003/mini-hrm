import { create } from "zustand";
import { UserAPIResponse, ModuleAPIResponse } from "../types/permission";

type PermissionMatrixState = {
  modules: ModuleAPIResponse[];
  isLoading: boolean;
  isSaving: boolean;
};

type PermissionMatrixActions = {
  setModules: (modules: ModuleAPIResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  addEmployeeToPermission: (permissionId: string, employee: UserAPIResponse) => void;
  removeEmployeeFromPermission: (permissionId: string, employeeId: string) => void;
  reset: () => void;
};

export type PermissionMatrixStore = PermissionMatrixState & PermissionMatrixActions;

const initialState: PermissionMatrixState = {
  modules: [],
  isLoading: false,
  isSaving: false,
};

export const usePermissionMatrixStore = create<PermissionMatrixStore>((set) => ({
  ...initialState,

  setModules: (modules) => set({ modules }),

  setLoading: (isLoading) => set({ isLoading }),

  setSaving: (isSaving) => set({ isSaving }),

  addEmployeeToPermission: (permissionId, employee) =>
    set((state) => ({
      modules: state.modules.map((module) => ({
        ...module,
        permissions: module.permissions.map((perm) =>
          perm.id === permissionId
            ? {
                ...perm,
                users: perm.users.some((u) => u.id === employee.id)
                  ? perm.users
                  : [...perm.users, employee],
              }
            : perm,
        ),
      })),
    })),

  removeEmployeeFromPermission: (permissionId, employeeId) =>
    set((state) => ({
      modules: state.modules.map((module) => ({
        ...module,
        permissions: module.permissions.map((perm) =>
          perm.id === permissionId
            ? { ...perm, users: perm.users.filter((u) => u.id !== employeeId) }
            : perm,
        ),
      })),
    })),

  reset: () => set(initialState),
}));
