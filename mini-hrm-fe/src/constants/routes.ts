export const routes = {
  home: "/",
  auth: {
    login: "/",
  },
  employeeManagement: "/employee-management",
  attendance: {
    manage: "/attendance/manage",
    personal: "/attendance/personal",
  },
  leave: {
    manage: "/leave/manage",
    personal: "/leave/personal",
  },
  permissionManagement: "/permission-management",
  workSettings: "/work-settings",
} as const;

export type AppRoutes = typeof routes;
