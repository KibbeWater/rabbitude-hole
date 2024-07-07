import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import LazyDevice from '~/components/models/LazyDevice';
import { api } from '~/trpc/server';

export default async function Device() {
    const device = await api.device.getDevice();
    if (!device) redirect('/dashboard/device/activate');

    async function unlinkDevice() {
        'use server';

        await api.device.unlinkDevice();
        revalidatePath('/dashboard/device/activate');
        redirect('/dashboard/device/activate');
    }

    return (
        <div className='relative h-[700px]'>
            <div className='absolute h-full w-full'>
                <div className='flex flex-col justify-center text-center font-grotesk'>
                    <p className='text-3xl font-light'>manage</p>
                    <h1 className='text-[160px] leading-none'>
                        {device.name ?? 'null'}
                        {"'"}s r1
                    </h1>
                </div>
            </div>
            <div className='absolute top-[4.8rem] flex h-full w-full justify-center'>
                <div className='absolute m-auto flex h-full w-full items-center justify-center gap-4'>
                    <div>
                        <button className='transition-opacity hover:opacity-70'>enable lost mode</button>
                    </div>
                    <div className='h-px w-6/12 bg-neutral-700'></div>
                    <form action={unlinkDevice}>
                        <button type='submit' className='text-accent transition-opacity hover:opacity-70'>
                            unlink device
                        </button>
                    </form>
                </div>
                <div className='h-full w-6/12'>
                    <LazyDevice />
                </div>
            </div>
        </div>
    );
}
