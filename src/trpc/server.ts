import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';

import { createCaller } from '~/server/api/root';
import { createTRPCContextServer } from '~/server/api/trpc';
import { auth } from '@clerk/nextjs/server';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
    const heads = new Headers(headers());
    heads.set('x-trpc-source', 'rsc');

    return createTRPCContextServer({ auth: auth(), headers: heads });
});

export const api = createCaller(createContext);
