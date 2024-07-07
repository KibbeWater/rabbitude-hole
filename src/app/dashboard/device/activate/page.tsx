import { redirect } from 'next/navigation';
import DashboardHeader from '~/components/DashboardHeader';
import DeviceLinkQR from '~/components/DeviceLinkQR';
import { api } from '~/trpc/server';

export const dynamic = 'force-dynamic';

export default async function Device() {
    const device = await api.device.getDevice();
    if (device) redirect('/dashboard/device');

    return (
        <>
            <DashboardHeader name='activate' description={'scan the QR code with your r1 to\nactivate your device.'} />
            <div className='flex justify-center pt-8'>
                <DeviceLinkQR size={256} />
            </div>
        </>
    );
}
