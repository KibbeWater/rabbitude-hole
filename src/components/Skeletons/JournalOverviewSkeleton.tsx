import SkeletonText from './SkeletonText';

export default function JournalOverviewSkeleton() {
    return (
        <div className='flex w-full flex-col gap-4 px-8'>
            <div className='flex justify-between'>
                <div className='flex w-8/12 flex-col gap-2'>
                    <SkeletonText className='h-6 w-full' />
                    <SkeletonText className='h-6 w-4/12' />
                </div>
                {/* Future icons */}
                <div />
            </div>
            <div className='flex flex-col gap-2'>
                <SkeletonText className='h-4 w-3/12' />
                <SkeletonText className='h-4 w-2/12' />
            </div>
            <div className='flex flex-col gap-2 border-t border-neutral-500 pt-4'>
                <SkeletonText className='h-4 w-10/12' />
                <SkeletonText className='h-4 w-9/12' />
                <SkeletonText className='h-4 w-7/12' />
                <SkeletonText className='h-4 w-8/12' />
            </div>
        </div>
    );
}
