'use client';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Loading..." />
        <p className="mt-4 text-gray-400 text-sm">Please wait while we fetch your data</p>
      </div>
    </div>
  );
}

