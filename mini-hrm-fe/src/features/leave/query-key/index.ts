export const leaveKeys = {
  all: ["leave-requests"] as const,
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (params: any) => [...leaveKeys.lists(), params] as const,
  my: () => [...leaveKeys.all, "my"] as const,
  myPaginated: (params: any) => [...leaveKeys.my(), params] as const,
  admin: () => [...leaveKeys.all, "admin"] as const,
  adminPaginated: (params: any) => [...leaveKeys.admin(), params] as const,
};
