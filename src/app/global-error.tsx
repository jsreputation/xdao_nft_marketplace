'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorIllustration } from '@/components/common/CartoonIllustrations';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Critical Error Icon */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-red-600/30 border-4 border-red-500 animate-pulse">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80">
              <ErrorIllustration />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Critical Error
          </h2>
          <p className="text-gray-400 text-lg mb-2 max-w-md mx-auto">
            A critical error occurred that prevented the application from loading properly.
          </p>
          <p className="text-gray-500 text-sm mb-2">
            {error.message || 'An unknown critical error occurred'}
          </p>
          {error.digest && (
            <p className="text-gray-600 text-xs mb-8 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Application
            </button>
            <Link
              href="/"
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-300 px-8 py-3 rounded-xl font-semibold hover:bg-gray-700/50 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-gray-600 text-sm">
          Please refresh the page or contact support if the problem continues.
        </p>
      </div>
    </body>
    </html>
  );
}

