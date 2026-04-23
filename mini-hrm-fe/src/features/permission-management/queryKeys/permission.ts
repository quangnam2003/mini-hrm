export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'all'] as const,
  save: () => [...permissionKeys.all, 'save'] as const,
};
