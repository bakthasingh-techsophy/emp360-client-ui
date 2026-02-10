import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsTab {
  id: string;
  label: string;
  icon?: string;
}

interface SystemSettingsTabsNavigationProps {
  tabs: SettingsTab[];
}

export function SystemSettingsTabsNavigation({ tabs }: SystemSettingsTabsNavigationProps) {
  return (
    <>
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <Select defaultValue={tabs[0]?.id}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop tabs */}
      <TabsList className="hidden md:inline-flex border-b border-border bg-transparent p-0 h-auto">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  );
}
