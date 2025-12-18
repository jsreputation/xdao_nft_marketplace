'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface NFTTabsProps {
  tabs: Tab[];
  children: React.ReactNode[];
  defaultTab?: string;
}

export function NFTTabs({ tabs, children, defaultTab }: NFTTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const activeContent = children[activeIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all duration-300 whitespace-nowrap
                  border-b-2 relative
                  ${isActive
                    ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-white dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-purple-600"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeContent}
      </div>
    </div>
  );
}

