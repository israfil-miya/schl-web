export const QNAP_DIR = ['ASC', 'DESC'] as const;
export type QnapDir = (typeof QNAP_DIR)[number];

export const QNAP_SORT_FIELDS = [
    'filename',
    'filesize',
    'filetype',
    'mt',
    'privilege',
    'owner',
    'group',
];
export type QnapSortField = (typeof QNAP_SORT_FIELDS)[number];

export const QNAP_ERROR_MAP: Record<number, string> = {
    0: 'Operation failed',
    1: 'Success',
    2: 'File or folder already exists',
    3: 'Session expired',
    4: 'Permission denied',
    5: 'File or folder not found',
    6: 'System is busy',
    9: 'Disk quota exceeded',
    16: 'Recycle bin disabled',
    17: 'Authentication failed',
    18: 'Account locked',
    19: 'Database busy',
    22: 'Transcoding in progress',
    25: 'File is locked',
    37: 'WebDAV mount limit exceeded',
    101: 'Invalid parameter',
    102: 'Missing parameter',
};
