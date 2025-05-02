import React, { ReactNode } from 'react';
import { createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

import { AuthProvider } from './context/AuthContext';
import { UserSettingsProvider } from './context/SettingContext'; // If you have it
import { ThemeProvider } from './context/ThemeContext';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    context: {
        auth: undefined!, 
        queryClient,
    },
    defaultErrorComponent: ({ error }: { error: Error }) => <div>Uh Oh!!! {error.message}</div>,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}



interface AppProvidersProps {
  children: ReactNode;
}


export function AppProviders({ children }: AppProvidersProps) {
  console.log("AppProviders: Rendering...");
  return (
    <React.StrictMode>
      {/* Provides TanStack Query client */}
      <QueryClientProvider client={queryClient}>
        {/* Provides Authentication context */}
        <AuthProvider>
          {/* Provides User Settings context (optional) */}
          <UserSettingsProvider>
          <ThemeProvider defaultTheme="system">
            {/* Render the rest of the application */}
            {children}
          </ThemeProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}