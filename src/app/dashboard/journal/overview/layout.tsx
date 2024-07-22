import JournalNavigation from '~/components/JournalNavigation';

export default async function OverviewLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex h-full w-9/12 self-center pb-12'>
            <JournalNavigation />
            {children}
        </div>
    );
}
