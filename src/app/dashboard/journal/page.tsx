import { useMemo } from 'react';
import DashboardHeader from '~/components/DashboardHeader';

const testData = [
    {
        // Get the current day as a date, excluding the current time
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        count: 3,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
        count: 5,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(0, 0, 0, 0)),
        count: 1,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).setHours(0, 0, 0, 0)),
        count: 0,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).setHours(0, 0, 0, 0)),
        count: 2,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).setHours(0, 0, 0, 0)),
        count: 4,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 6)).setHours(0, 0, 0, 0)),
        count: 0,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0)),
        count: 3,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 8)).setHours(0, 0, 0, 0)),
        count: 2,
    },
    {
        // Get the day before the current day as a date, excluding the current time
        date: new Date(new Date(new Date().setDate(new Date().getDate() - 9)).setHours(0, 0, 0, 0)),
        count: 1,
    },
];

type JournalEntry = { date: Date; count: number };
function groupByMonth(data: JournalEntry[]) {
    const grouped = data.reduce(
        (acc, item) => {
            const month = item.date.toLocaleString('default', { month: 'long' });
            if (!acc[month]) acc[month] = [];
            acc[month].push(item);
            return acc;
        },
        {} as Record<string, JournalEntry[]>,
    );

    return grouped;
}

function JournalBaseItem({ className, children }: { className?: string; children?: React.ReactNode }) {
    return <div className={['flex h-4 items-center', className].join(' ')}>{children}</div>;
}

function DateItem({ date }: { date: Date }) {
    // If the date is today, we should show 'Today' instead of the date
    const d =
        date.getDate() === new Date().getDate()
            ? 'Today'
            : date.toLocaleString('default', { month: 'short', day: 'numeric' });

    return (
        <JournalBaseItem className='justify-end'>
            <p className='text-sm leading-none'>{d}</p>
        </JournalBaseItem>
    );
}

function JournalGroup({ month, entries }: { month: string; entries: JournalEntry[] }) {
    return (
        <div className='flex w-full grow-0'>
            <div className='w-44 border-t border-neutral-500 pt-2'>
                <p className='font-grotesk text-3xl'>{month}</p>
            </div>
            {/* We should be using a grid, but flex works so whatever */}
            <div className='flex w-12 grow-0 flex-col gap-2 border-t border-neutral-500 pt-2'>
                {entries.map((entry) => (
                    <DateItem date={entry.date} key={entry.date.toString()} />
                ))}
            </div>
            <div className='flex grow flex-col gap-2 pt-2'>
                {entries.map((entry) => (
                    <JournalBaseItem className='px-4' key={entry.date.toString()}>
                        <div className='h-3 w-full rounded-sm bg-accent'></div>
                    </JournalBaseItem>
                ))}
            </div>
        </div>
    );
}

export default async function Journal() {
    const grouped = useMemo(() => groupByMonth(testData), []);

    return (
        <>
            <DashboardHeader name='journal' description={'discover and manage information\nyour r1 has saved'} />
            <div className='flex flex-col gap-8 pt-12'>
                {Object.entries(grouped).map(([month, entries]) => (
                    <JournalGroup month={month} entries={entries} key={month} />
                ))}
            </div>
        </>
    );
}
