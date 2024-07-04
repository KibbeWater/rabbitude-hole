import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

import BouncingRabbit from "~/components/BouncingRabbit";

export default async function Home() {
    return (
        <main className="flex h-full flex-col items-center justify-evenly lowercase">
            <div className="flex flex-col items-center gap-4">
                <BouncingRabbit size={256} />
                <div className="flex justify-center">
                    <p className="font-grotesk text-2xl font-semibold text-white">Don{"'"}t follow the white Rabbit</p>
                </div>
            </div>
            <SignedIn>
                <Link
                    href={"/dashboard/journal"}
                    className="bg-accent hover:bg-accent/80 rounded-2xl px-4 py-2 font-grotesk text-white transition-all duration-300"
                >
                    go to your account
                </Link>
            </SignedIn>
            <SignedOut>
                <SignInButton mode={"modal"}>
                    <button className="bg-accent hover:bg-accent/80 rounded-2xl px-4 py-2 font-grotesk text-white transition-all duration-300">
                        join rabbitude
                    </button>
                </SignInButton>
            </SignedOut>
        </main>
    );
}
