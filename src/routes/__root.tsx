import { AuthContext } from '@/context/AuthContext';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import type { QueryClient } from '@tanstack/react-query';

export interface MyRouterContext {
    auth: typeof AuthContext;
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
    search: {
        // middlewares: [retainSearchParams(['page', 'perPage', 'sort'] as any)],
    },
});

function RootComponent() {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
        </>
    );
}
