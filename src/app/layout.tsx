import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const metadata: Metadata = {
  title: 'XDAO - Decentralized NFT Marketplace',
  description: 'The decentralized marketplace for unique digital assets on Avalanche. Trade with confidence, own with pride.',
  icons: {
    icon: '/assets/logo_main.png',
    shortcut: '/assets/logo_main.png',
    apple: '/assets/logo_main.png',
  },
  // Performance: Add resource hints
  other: {
    'dns-prefetch': 'https://api.thegraph.com https://*.ipfs.io https://*.web3modal.org',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Performance: Preconnect to external domains */}
        <link rel="preconnect" href="https://api.thegraph.com" />
        <link rel="dns-prefetch" href="https://api.thegraph.com" />
        <link rel="preconnect" href="https://ipfs.io" />
        <link rel="dns-prefetch" href="https://ipfs.io" />
        <link rel="preconnect" href="https://gateway.pinata.cloud" />
        <link rel="dns-prefetch" href="https://gateway.pinata.cloud" />
        <link rel="preconnect" href="https://gateway.lighthouse.storage" />
        <link rel="dns-prefetch" href="https://gateway.lighthouse.storage" />
        <link rel="preconnect" href="https://api.web3modal.org" />
        <link rel="dns-prefetch" href="https://api.web3modal.org" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <Providers>
            <Navbar />
            {children}
            <Footer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
