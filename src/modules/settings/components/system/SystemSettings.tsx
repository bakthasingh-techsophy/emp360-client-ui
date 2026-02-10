import { PageLayout } from '@/components/PageLayout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ApprovalWorkflowTab } from '@/modules/expenses-assets/components/settings/ApprovalWorkflowTab';
import { IntimationWorkflowTab } from '@/modules/expenses-assets/components/settings/IntimationWorkflowTab';
import { SystemSettingsTabsNavigation } from './SystemSettingsTabsNavigation';

const SYSTEM_SETTINGS_TABS = [
  { id: 'approval', label: 'Approval Workflows', icon: 'CheckCircle2' },
  { id: 'intimation', label: 'Intimation Workflows', icon: 'Bell' },
];

export function SystemSettings() {
  return (
    <PageLayout
      title="System Settings"
      showBackButton
      toolbar={{
        description: 'Configure system-wide approval and intimation workflows',
      }}
    >
      <Tabs defaultValue="approval" className="w-full">
        <div className="overflow-x-auto">
          <SystemSettingsTabsNavigation tabs={SYSTEM_SETTINGS_TABS} />
        </div>

        <div className="mt-6">
          <TabsContent value="approval" className="mt-0">
            <ApprovalWorkflowTab />
          </TabsContent>

          <TabsContent value="intimation" className="mt-0">
            <IntimationWorkflowTab />
          </TabsContent>
        </div>
      </Tabs>
    </PageLayout>
  );
}

export default SystemSettings;
