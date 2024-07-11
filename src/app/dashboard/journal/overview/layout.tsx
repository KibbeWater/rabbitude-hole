import MagnifyingIcon from '~/components/Icons/MagnifyingGlass';

export default async function OverviewLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex h-full w-8/12 self-center pb-12'>
            <div className='flex min-h-full w-5/12 flex-col gap-4 border-r border-neutral-500 pr-4'>
                <div className='flex w-full items-center gap-6 border-b border-neutral-500 py-2'>
                    <input
                        placeholder='search'
                        className='grow bg-transparent font-grotesk outline-none placeholder:text-neutral-600'
                    />{' '}
                    <div className='aspect-square h-full grow-0 p-px text-neutral-500'>
                        <MagnifyingIcon />
                    </div>
                </div>
                {/* Placeholder */}
                <div className='h-full w-full rounded-lg bg-white/20'></div>
            </div>
            {children}
        </div>
    );
}
