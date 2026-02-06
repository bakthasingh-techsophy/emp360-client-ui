/**
 * Settings Tabs Navigation Component
 * Responsive tabs navigation for settings - dropdown on mobile, scrollable tabs on desktop
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsTab } from '../../UserManagementSettings';

interface SettingsTabsNavigationProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function SettingsTabsNavigation({
  tabs,
  activeTab,
  onTabChange,
}: SettingsTabsNavigationProps) {
  return (
    <>
      {/* Small Mobile: Dropdown selector */}
      <div className="md:hidden mb-0 px-4 pt-4">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <span>{tabs.find(t => t.key === activeTab)?.label}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem 
                key={tab.key} 
                value={tab.key}
              >
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medium & Large screens: Scrollable tabs */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin border-b">
        <div className="min-w-max px-4">
          <TabsList className="w-auto inline-flex">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
    </>
  );
}
