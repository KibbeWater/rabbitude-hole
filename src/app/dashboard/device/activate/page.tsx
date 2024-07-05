import DashboardHeader from '~/components/DashboardHeader';
import DeviceLinkQR from '~/components/DeviceLinkQR';

export default async function Device() {
    return (
        <>
            <DashboardHeader name='activate' description={'scan the QR code with your r1 to\nactivate your device.'} />
            <div className='flex justify-center pt-8'>
                <DeviceLinkQR size={256} />
            </div>
        </>
    );
}
