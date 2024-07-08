'use client';

import { useMemo, useRef, useState } from 'react';
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

function JournalBaseItem({ className, children, id }: { className?: string; children?: React.ReactNode; id?: string }) {
    return (
        <div className={['flex h-4 items-center', className].join(' ')} id={id}>
            {children}
        </div>
    );
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

const normalMultiplier = 0.5;
const adjacentMultiplier = 0.75;
const heldMultiplier = 1;
function JournalGroup({ month, entries }: { month: string; entries: JournalEntry[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const groupedWidths = useMemo(() => {
        const maxWidth = containerRef.current?.clientWidth ?? 0;
        const obj = { [month]: entries };
        const widths = Object.entries(obj).reduce(
            (acc, [month, entries]) => {
                const total = entries.reduce((acc, entry) => acc + entry.count, 0);
                acc[month] = {
                    total,
                    max: Math.max(...entries.map((entry) => entry.count)),
                    min: Math.min(...entries.map((entry) => entry.count)),
                    widths: [],
                };
                const widths = entries.map((entry, idx) => {
                    const width = (entry.count / acc[month]!.max) * maxWidth;
                    const isAdjacent = hovered === idx + 1 || hovered === idx - 1;

                    const multiplier = isAdjacent
                        ? adjacentMultiplier
                        : idx === hovered
                          ? heldMultiplier
                          : normalMultiplier;
                    return width * multiplier;
                });
                return { [month]: { ...acc[month], widths } };
            },
            {} as Record<string, { total: number; max: number; min: number; widths: number[] }>,
        );

        return widths;
    }, [month, entries, hovered]);

    return (
        <div className='flex w-full grow-0'>
            <div className='w-44 flex-none grow-0 border-t border-neutral-500 pt-2'>
                <p className='font-grotesk text-3xl'>{month}</p>
            </div>
            {/* We should be using a grid, but flex works so whatever */}
            <div className='flex w-12 flex-none grow-0 flex-col gap-2 border-t border-neutral-500 pt-2'>
                {entries.map((entry) => (
                    <DateItem date={entry.date} key={entry.date.toString()} />
                ))}
            </div>
            <div ref={containerRef} className='flex grow flex-col gap-2 pt-2'>
                {entries.map((entry, idx) => (
                    <JournalBaseItem className='px-4' key={entry.date.toString()}>
                        <div
                            style={{
                                width: `${groupedWidths[month]?.widths[idx] ?? 0}px`,
                            }}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                            className='h-3 w-full rounded-sm bg-accent transition-all'
                        ></div>
                    </JournalBaseItem>
                ))}
            </div>
        </div>
    );
}

export default function Journal() {
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
