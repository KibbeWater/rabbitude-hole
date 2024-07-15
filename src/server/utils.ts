import { createHash } from 'crypto';

import { env } from '~/env';
import { type JournalTextEntry, textShape } from '~/types/journal';

// Generate a linking code which expires after 10 seconds
export function generateLinkingCode(userId: string): { hash: string; expiration: number } {
    const secret = env.SECRET_KEY.slice(0, 16);

    const linkKeyLifetime = 1000 * 60; // 60 seconds
    const currentTime = Math.floor(Date.now() / linkKeyLifetime);
    const timeUntilExpiration = linkKeyLifetime - (Date.now() % linkKeyLifetime);

    const userIdHash = createHash('sha256').update(userId).digest('hex');

    const hash = createHash('sha256')
        .update(`${secret}_${currentTime}_${userIdHash.slice(0, 16)}`)
        .digest('hex');

    return {
        hash,
        expiration: timeUntilExpiration,
    };
}

// The client key is a hashed using sha256 from the string `${imei}_${accountKey}_${floor(timeInSeconds/10)}`
export function generateBackendAuthToken(imei: string, deviceId: string) {
    const currentTime = Math.floor(Date.now() / 10000);

    return createHash('sha256').update(`${imei}_${deviceId}_${currentTime}`).digest('hex');
}

export function getJournalTextMeta(data: unknown): JournalTextEntry | undefined {
    const parsed = textShape.safeParse(data);
    if (!parsed.success) return undefined;
    return parsed.data;
}
