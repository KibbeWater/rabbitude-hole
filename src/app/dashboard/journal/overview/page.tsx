export default async function Overview() {
    return (
        <div className='flex w-full flex-col gap-4 px-8'>
            <div className='flex justify-between'>
                <div className='flex w-7/12 font-grotesk'>
                    <p className='text-3xl'>What is the Rabbit company</p>
                </div>
                {/* Future icons */}
                <div />
            </div>
            <div className='flex flex-col gap-2 font-grotesk'>
                <p className='text-sm'>july 11, 2024 12:15 am</p>
                <p className='text-sm text-neutral-500'>created on snow&apos;s r1</p>
            </div>
            <div className='flex flex-col gap-2 border-t border-neutral-500 pt-4'>
                <p className='font-grotesk'>
                    The Rabbit Company offers high-quality rabbit vibrators with a 5-year warranty, hypoallergenic
                    materials, and whisper-quiet operation.
                </p>
            </div>
        </div>
    );
}
