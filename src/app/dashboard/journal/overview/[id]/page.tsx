import { notFound } from 'next/navigation';
import { api } from '~/trpc/server';

// TODO: Perhaps we can cache all entries and restrict access through the middleware, should result in lower amount of DB calls here
export default async function OverviewEntry({ params }: { params: { id: string } }) {
    if (isNaN(parseInt(params.id))) notFound();
    const id = parseInt(params.id);

    const entry = await api.journal.getEntry(id);
    if (!entry) notFound();

    return (
        <div className='flex w-full flex-col gap-4 px-8'>
            <div className='flex justify-between'>
                <div className='flex w-7/12 font-grotesk'>
                    <p className='text-3xl'>{entry.title}</p>
                </div>
                {/* Future icons */}
                <div />
            </div>
            <div className='flex flex-col gap-2 font-grotesk'>
                <p className='text-sm'>july 11, 2024 12:15 am</p>
                <p className='text-sm text-neutral-500'>created on {entry.deviceName}&apos;s r1</p>
            </div>
            <div className='flex flex-col gap-2 border-t border-neutral-500 pt-4'>
                <p className='font-grotesk'>{entry.text}</p>
            </div>
        </div>
    );
}
