import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

import BouncingRabbit from '~/components/BouncingRabbit';

export default async function Home() {
    return (
        <main className='flex h-full flex-col items-center justify-evenly lowercase'>
            <div className='flex flex-col items-center gap-4'>
                <BouncingRabbit size={256} />
                <div className='flex justify-center'>
                    <p className='font-grotesk text-2xl font-normal text-white'>Don{"'"}t follow the white Rabbit</p>
                </div>
            </div>
            <SignedIn>
                <Link
                    href={'/dashboard/journal'}
                    className='rounded-2xl bg-accent px-4 py-2 font-grotesk text-white transition-all duration-300 hover:bg-accent/80'
                >
                    go to your account
                </Link>
            </SignedIn>
            <SignedOut>
                <SignInButton mode={'modal'}>
                    <button className='rounded-2xl bg-accent px-4 py-2 font-grotesk text-white transition-all duration-300 hover:bg-accent/80'>
                        join rabbitude
                    </button>
                </SignInButton>
            </SignedOut>
        </main>
    );
}
