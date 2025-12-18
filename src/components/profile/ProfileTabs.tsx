'use client';

import { useState } from 'react';

interface ProfileTabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
}

export function ProfileTabs({ tabs }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex overflow-x-auto space-x-0.5 px-3 sm:px-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-purple-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

