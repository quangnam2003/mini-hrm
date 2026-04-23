export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  my: () => [...attendanceKeys.all, 'my'] as const,
  generate: () => [...attendanceKeys.all, 'generate'] as const,
};

