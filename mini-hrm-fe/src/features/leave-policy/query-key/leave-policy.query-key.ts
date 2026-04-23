export const leavePolicyKeys = {
  all: ["leave-policy"] as const,
  list: () => [...leavePolicyKeys.all, "list"] as const,
  detail: (id: number | string) => [...leavePolicyKeys.all, "detail", id] as const,
};
