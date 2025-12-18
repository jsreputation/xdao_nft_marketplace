'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { ToastContainer } from '@/components/common/Toast';
import { ThemeProvider } from '@/context/ThemeContext';
import dynamic from 'next/dynamic';
import '@rainbow-me/rainbowkit/styles.css';

// Create QueryClient as singleton to prevent recreation on every render
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Dynamically import wallet providers to avoid SSR issues with indexedDB
const WalletProviders = dynamic(
  () => import('./WalletProviders').then((mod) => mod.WalletProviders),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    ),
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  // Use singleton QueryClient
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviders>
        <ApolloProvider client={apolloClient}>
          <ThemeProvider>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </ApolloProvider>
      </WalletProviders>
    </QueryClientProvider>
  );
}

