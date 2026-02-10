import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ApprovalWorkflowTab } from '@/modules/expenses-assets/components/settings/ApprovalWorkflowTab';
import { IntimationWorkflowTab } from '@/modules/expenses-assets/components/settings/IntimationWorkflowTab';
import { SystemSettingsTabsNavigation } from './components/system/SystemSettingsTabsNavigation';

const SYSTEM_SETTINGS_TABS = [
  { id: 'approval', label: 'Approval Workflows', icon: 'CheckCircle2' },
  { id: 'intimation', label: 'Intimation Workflows', icon: 'Bell' },
];

export function SystemSettings() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <PageLayout
      toolbar={
        <div className="space-y-4">
          {/* Page Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  System Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure system-wide approval and intimation workflows
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Tabs defaultValue="approval" className="w-full">
        <div className="overflow-x-auto">
          <SystemSettingsTabsNavigation tabs={SYSTEM_SETTINGS_TABS} />
        </div>

        <div className="px-4 py-6">
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

