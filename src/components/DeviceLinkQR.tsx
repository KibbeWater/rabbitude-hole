'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import QRCode from 'react-qr-code';

import { api } from '~/trpc/react';

function generateLinkingURL(linkingCode: string, userId: string) {
    return `https://${window.location.host}/api/link?code=${linkingCode}&userId=${userId}`;
}

export default function DeviceLinkQR({ size = 128 }: { size?: number }) {
    const { userId } = useAuth();
    const { data, refetch } = api.device.getLinkingCode.useQuery();

    // Automatically refresh the linking code when it expires
    useEffect(() => {
        if (!data) return;

        const timeout = setTimeout(() => {
            refetch().catch(console.error);
        }, data.expiration);

        return () => clearTimeout(timeout);
    }, [data, refetch]);

    return (
        <div>{data && userId && <QRCode size={size} level={'M'} value={generateLinkingURL(data.hash, userId)} />}</div>
    );
}
