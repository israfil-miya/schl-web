export const CLIENT_STATUSES = ['none', 'pending', 'approved'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
