"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

// TODO: Extract to components l8r
function InputBox({
    label,
    value,
    type = "text",
    onChange,
}: {
    label: string;
    value: string;
    type?: string;
    onChange: (e: string) => void;
}) {
    const uuid = Math.random().toString(36).substring(7);
    return (
        <div className="flex flex-col">
            <label htmlFor={uuid} className="font-light text-neutral-700">
                {label}
            </label>
            <input
                type={type}
                id={uuid}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-neutral-300 px-2 py-1"
            />
        </div>
    );
}

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className="flex h-full items-center justify-center">
            <div className="flex min-w-96 flex-col gap-6 rounded-3xl bg-white/90 p-8">
                <div className="flex flex-col items-center gap-3 font-grotesk font-light">
                    <h1 className="font-grotesk text-3xl">rabbitude</h1>
                    <p className="text-xl text-neutral-500">welcome</p>
                    <p className="text-sm text-neutral-500">log in to continue to rabbitude.</p>
                </div>
                <form className="flex flex-col gap-2 font-grotesk">
                    <InputBox label="Email" type="email" value={email} onChange={setEmail} />
                    <InputBox label="Password" type="password" value={password} onChange={setPassword} />
                    {/* for the future */}
                    {/* <Link href={"/auth/lostpass"} className="text-accent text-sm font-light">
                        forgot password?
                    </Link> */}
                    <button
                        type="submit"
                        className="bg-accent w-full rounded-3xl py-2 pt-2 font-light text-white"
                        onClick={(e) => {
                            e.preventDefault();
                            // signIn()
                        }}
                    >
                        continue
                    </button>
                    <p className="text-xs font-thin text-neutral-500">
                        {"don't have an account?"}{" "}
                        <Link className="text-accent" href={"/auth/signup"}>
                            sign up
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
