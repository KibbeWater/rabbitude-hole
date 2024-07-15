'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

import EyeIcon from '~/components/Icons/EyeIcon';
import MagnifyingIcon from '~/components/Icons/MagnifyingGlass';
import { getJournalTextMeta } from '~/server/utils';
import { api } from '~/trpc/react';

function JournalEntry({
    color,
    active,
    title,
    description,
    time,
}: {
    color: string;
    active: boolean;
    title: string;
    description: string;
    time: Date;
}) {
    const timeLocale = time.toLocaleTimeString('default', {
        hour: 'numeric',
        minute: 'numeric',
    });

    return (
        <div className='flex w-full gap-3 px-8 py-4'>
            <div className='flex h-full w-8 flex-none px-1'>
                <div className='size-6' style={{ color }}>
                    <EyeIcon />
                </div>
            </div>
            <div className='h-full w-4 pt-1'>
                <div
                    className='size-4 flex-none rounded-full border-2 transition-colors'
                    style={{ borderColor: color, backgroundColor: active ? color : 'transparent' }}
                />
            </div>
            <div className='flex flex-col gap-1 overflow-hidden font-grotesk'>
                <div className='flex justify-between gap-8'>
                    <h3 className='truncate whitespace-nowrap font-medium' style={{ color }}>
                        {title}
                    </h3>
                    <p className='flex-none text-neutral-500'>{timeLocale}</p>
                </div>

                <p className='truncate whitespace-nowrap text-neutral-400'>{description}</p>
            </div>
        </div>
    );
}

export default function JournalNavigation() {
    const { data } = api.journal.getEntries.useInfiniteQuery(
        { limit: 20 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const pathname = usePathname();

    const entries = useMemo(() => data?.pages.map((page) => page.items).flat() ?? [], [data]);

    // Group all entries by month
    const grouped = useMemo(() => {
        const grouped = entries.reduce(
            (acc, entry) => {
                const date = new Date(entry.createdAt);
                const month = date.toLocaleString('default', {
                    month: 'long',
                    day: 'numeric',
                });
                if (!acc[month]) acc[month] = [];
                acc[month].push(entry);
                return acc;
            },
            {} as Record<string, typeof entries>,
        );
        return grouped;
    }, [entries]);

    return (
        <div className='flex min-h-full w-5/12 flex-none flex-col gap-4 border-r border-neutral-500 pr-4'>
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
            <div className='flex h-full w-full flex-col gap-12'>
                {Object.entries(grouped).map(([month, entries]) => (
                    <div key={`journal-month-${month.toLowerCase()}`} className='flex w-full flex-col gap-6'>
                        <h2 className='font-grotesk text-2xl'>{month}</h2>
                        {entries.map((entry) => {
                            switch (entry.entryType) {
                                case 'text':
                                    const textMeta = getJournalTextMeta(entry.metadata);
                                    const url = `/dashboard/journal/overview/${entry.id}`;
                                    const isActive = pathname === url;
                                    return (
                                        <Link
                                            key={`journal-entry-${entry.id}`}
                                            prefetch={true}
                                            href={url}
                                            className={[
                                                'cursor-pointer rounded-2xl transition-colors',
                                                isActive && 'bg-red-500/10',
                                            ].join(' ')}
                                        >
                                            <JournalEntry
                                                title={entry.title ?? ''}
                                                description={textMeta?.response ?? ''}
                                                time={entry.createdAt}
                                                active={isActive}
                                                color='#ef4444'
                                            />
                                        </Link>
                                    );
                                default:
                                    break;
                            }
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
