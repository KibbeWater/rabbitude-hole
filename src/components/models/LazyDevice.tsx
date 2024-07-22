'use client';

import dynamic from 'next/dynamic';

const DeviceScene = dynamic(() => import('~/components/models/DeviceScene').then((mod) => mod.DeviceScene), {
    ssr: false,
});

export default function LazyDevice() {
    return <DeviceScene />;
}
