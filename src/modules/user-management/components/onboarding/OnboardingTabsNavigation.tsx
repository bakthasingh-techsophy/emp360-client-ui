import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingTab } from '../../types/onboarding.types';

interface OnboardingTabsNavigationProps {
  tabs: OnboardingTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function OnboardingTabsNavigation({
  tabs,
  activeTab,
  onTabChange,
}: OnboardingTabsNavigationProps) {
  return (
    <>
      {/* Small Mobile: Dropdown selector */}
      <div className="md:hidden mb-6 px-4">
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
                disabled={tab.isLocked}
              >
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medium & Large screens: Scrollable tabs */}
      <div className="hidden md:block overflow-x-auto mb-6 scrollbar-thin">
        <div className="min-w-max px-4">
          <TabsList className="w-auto inline-flex">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                disabled={tab.isLocked}
                className="data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
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
