"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export default function Navbar({ className }: { className?: string }) {
    return (
        <>
            <div className={["flex items-center justify-between bg-black px-4", className].join(" ")}>
                <div className="flex">
                    <div className="flex w-64 items-center gap-6">
                        <Link href="/">
                            <Image src={"/assets/icons/favicon.svg"} alt="Rabbitude Hole" width={54} height={54} />
                        </Link>
                        <Link
                            href="/"
                            className="group/logo font-grotesk text-2xl font-light text-white transition-all duration-500"
                        >
                            rabbi<span className="group-hover/logo:text-accent transition-all duration-500">tude</span>
                        </Link>
                    </div>
                    {/* <div>
                        <p></p>
                    </div> */}
                </div>
                <div className="text-semibold flex items-center gap-4 font-grotesk text-base text-white">
                    <SignedOut>
                        <SignInButton />
                        {/* <Link href="/auth/signin" className="text-white">
                        Sign In
                    </Link>
                    <Link href="/auth/signup" className="text-white">
                        Sign Up
                    </Link> */}
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </>
    );
}
