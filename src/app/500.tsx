'use client';

import Link from 'next/link';
import { ServerErrorIllustration } from '@/components/common/CartoonIllustrations';

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 500 Number */}
        <div className="mb-8 relative">
          <h1 className="text-9xl sm:text-[12rem] font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent animate-pulse-slow">
            500
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-orange-500">500</h1>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80">
            <ServerErrorIllustration />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Internal Server Error
        </h2>
        <p className="text-gray-400 text-lg mb-2 max-w-md mx-auto">
          Our servers are experiencing some technical difficulties.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          We're working to fix the issue. Please try again in a few moments.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Page
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

        {/* Status Indicator */}
        <div className="mt-12 flex justify-center items-center gap-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-gray-500 text-sm">Server Status: Recovering</span>
        </div>
      </div>
    </div>
  );
}

