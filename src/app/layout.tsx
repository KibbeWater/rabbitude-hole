import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "~/components/Navbar";

export const metadata = {
    title: "Rabbitude Hole",
    description: "Don't follow the white rabbit",
    icons: [
        { rel: "icon", url: "/assets/icons/favicon.png", type: "image/png" },
        {
            rel: "icon",
            url: "/assets/icons/favicon.svg",
            type: "image/svg+xml",
        },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${GeistSans.variable} h-full`}>
            <body className="flex h-full flex-col bg-black pt-20">
                <Navbar className="absolute left-0 right-0 top-0 h-20" />
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
