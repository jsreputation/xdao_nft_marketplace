'use client';

import Link from 'next/link';
import { NotFoundIllustration } from '@/components/common/CartoonIllustrations';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="mb-8 relative">
          <h1 className="text-9xl sm:text-[12rem] font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-primary-400 bg-clip-text text-transparent animate-pulse-slow">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-primary-500">404</h1>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80">
            <NotFoundIllustration />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-lg mb-2 max-w-md mx-auto">
          Oops! The NFT you're looking for seems to have been transferred to another wallet.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/explore"
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-300 px-8 py-3 rounded-xl font-semibold hover:bg-gray-700/50 hover:text-white transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore NFTs
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
