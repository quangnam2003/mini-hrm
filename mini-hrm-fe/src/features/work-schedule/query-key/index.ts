export const workScheduleKeys = {
  all: ["work-schedule"] as const,
  lists: () => [...workScheduleKeys.all, "list"] as const,
};
