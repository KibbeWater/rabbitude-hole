import '~/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import { TRPCReactProvider } from '~/trpc/react';
import Navbar from '~/components/Navbar';

import tailwindConfig from 'tailwind.config';

export const metadata = {
    title: 'Rabbitude Hole',
    description: "Don't follow the white rabbit",
    icons: [
        { rel: 'icon', url: '/assets/icons/favicon.png', type: 'image/png' },
        {
            rel: 'icon',
            url: '/assets/icons/favicon.svg',
            type: 'image/svg+xml',
        },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className={`${GeistSans.variable} h-full`}>
            <ClerkProvider
                appearance={{
                    baseTheme: dark,
                    variables: {
                        colorPrimary: tailwindConfig.theme.extend.colors.accent,
                    },
                }}
            >
                <body className='flex h-full flex-col bg-black pt-20 text-white'>
                    <Navbar className='absolute left-0 right-0 top-0 h-20' />
                    <TRPCReactProvider>{children}</TRPCReactProvider>
                </body>
            </ClerkProvider>
        </html>
    );
}
