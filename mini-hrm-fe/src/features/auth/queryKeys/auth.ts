export const authKeys = {
  all: ["auth"] as const,
  permissions: (userId: string) => [...authKeys.all, "permissions", userId] as const,
};
