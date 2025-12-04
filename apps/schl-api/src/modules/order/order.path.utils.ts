// Helper utilities for mapping and path building

export const joinPath = (base: string, suffix: string) => {
    const b = String(base || '').replace(/[\\/]+$/, '');
    const s = String(suffix || '').replace(/^[\\/]+/, '');
    return `${b}/${s}`;
};

export const escapeRegex = (s: string) =>
    String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Map windows/UNC path or QNAP path to QNAP-style path with drive mapping.
 * Accepts optional rawMap JSON or a CSV style mapping (e.g. 'P:Production')
 */
export function mapFolderPathToQnapPath(
    input: string,
    rawMap?: string | null,
): string {
    const str = String(input || '').trim();
    if (!str) return '';

    if (str.startsWith('/')) return str.replace(/\\+/g, '/');

    const mapping: Record<string, string> = { P: 'Production' };

    if (rawMap) {
        try {
            const parsed = JSON.parse(rawMap) as Record<string, unknown>;
            if (typeof parsed === 'object' && parsed !== null) {
                for (const [k, v] of Object.entries(parsed)) {
                    mapping[String(k).toUpperCase()] = String(v);
                }
            }
        } catch {
            try {
                rawMap.split(',').forEach(pair => {
                    const [k, v] = pair.split(':');
                    if (k && v) mapping[String(k).toUpperCase()] = String(v);
                });
            } catch {
                /* ignore */
            }
        }
    }

    // Windows drive e.g. P:\path\to
    const winDrive = str.match(/^([A-Za-z]):[\\/](.*)$/);
    if (winDrive && winDrive[1]) {
        const drive = String(winDrive[1]).toUpperCase();
        const rest = String(winDrive[2] ?? '').replace(/\\+/g, '/');
        const share = mapping[drive] || drive;
        return `/${share}/${rest}`;
    }

    // UNC path e.g. \\server\share\rest
    const unc = str.match(/^\\\\[^\\]+\\([^\\]+)\\?(.*)$/);
    if (unc) {
        const share = unc[1];
        const rest = (unc[2] || '').replace(/\\+/g, '/');
        return `/${share}/${rest}`;
    }

    return `/${str.replace(/\\+/g, '/')}`;
}

/**
 * Decide the candidate suffix (sub-path) based on job type and fileCondition
 */
export function getCandidateSuffix(
    normalizedType: string,
    normalizedCondition: string,
): string {
    if (normalizedType === 'general' || normalizedType === 'test') {
        return normalizedCondition === 'incomplete'
            ? 'PRODUCTION/PARTIALLY DONE'
            : 'RAW';
    }
    if (normalizedType.startsWith('qc')) {
        return normalizedCondition === 'incomplete'
            ? 'QC/PARTIALLY DONE'
            : 'PRODUCTION/DONE';
    }
    if (normalizedType.startsWith('correction')) {
        return normalizedCondition === 'incomplete'
            ? 'FEEDBACK/PARTIALLY DONE'
            : 'FEEDBACK';
    }
    // fallback
    return normalizedCondition === 'incomplete'
        ? 'PRODUCTION/PARTIALLY DONE'
        : 'RAW';
}
