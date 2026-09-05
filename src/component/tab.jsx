import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {

} from 'lucide-react';
// Staff,tabData
export const Tab_C = ({ content, tab, className = "" }) => {
  const [activeTab, setActiveTab] = useState(0);

  // const tabs = AdminTabTitle || StaffTabTitle 
  return (
    <div className={`mx-auto w-full ${className}`}>

      <Tabs
        selectedIndex={activeTab}
        onSelect={(index) => setActiveTab(index)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="relative  border-b border-gray-100">
          <TabList className="flex w-full overflow-x-auto no-scrollbar outline-none">
            {tab?.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === index;

              return (
                <Tab
                  key={index}
                  className="relative w-37 flex-none cursor-pointer outline-none sm:w-auto sm:flex-1"
                  selectedClassName="is-selected"
                >
                  <div className={`
                    flex items-center justify-center gap-2 px-4 py-4
                    transition-all duration-300 ease-in-out
                    ${isActive ? 'text-amber-600' : 'text-gray-500 hover:text-amber-500'}
                  `}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="whitespace-nowrap text-sm font-semibold md:text-base">
                      {item.title.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* HR line for active tab */}
                  {isActive && (
                    <div
                      className={`absolute bottom-0 h-0.5 bg-linear-to-r from-amber-400
                         to-amber-600 transition-all duration-300 ease-out
                          ${isActive && 'animate-in'}  `}
                      style={{
                        width: `${100}%`,
                        left: '0',
                        transform: 'none',
                      }}
                    />
                  )}

                  {/* HR line separator between tabs - only show between items */}
                  {index < tab.length - 1 && (
                    <div
                      className="absolute top-1/2 right-0 h-8 w-px bg-gray-200 -translate-y-1/2"
                      style={{
                        opacity: isActive || activeTab === index + 1 ? '0.3' : '1'
                      }}
                    />
                  )}
                </Tab>
              );
            })}
          </TabList>
        </div>

        <div className="min-w-0 bg-white">
          {tab?.map((item, index) => {
            const ActiveComponent =
              content?.[item.key] ||
              content?.[item.key];
            return (

              <TabPanel
                key={index}
                className="outline-none"
              >
                {ActiveComponent && <ActiveComponent />}
                {/*  */}

              </TabPanel>
            )
          })}
        </div>
      </Tabs>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Custom Tailwind-like animation if not using Tailwind Animate plugin */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};