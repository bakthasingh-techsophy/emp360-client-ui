/**
 * User Management Settings Page
 * Configure employee types, work locations, designations, and departments
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/components/PageLayout';
import { SettingsTabsNavigation } from './components/settings/SettingsTabsNavigation';
import { EmployeeTypesTab } from './components/settings/EmployeeTypesTab';
import { WorkLocationsTab } from './components/settings/WorkLocationsTab';
import { DesignationsTab } from './components/settings/DesignationsTab';
import { DepartmentsTab } from './components/settings/DepartmentsTab';

export interface SettingsTab {
  key: string;
  label: string;
}

export function UserManagementSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employee-types');

  // Define settings tabs
  const tabs: SettingsTab[] = [
    { key: 'employee-types', label: 'Employee Types' },
    { key: 'work-locations', label: 'Work Locations' },
    { key: 'designations', label: 'Designations' },
    { key: 'departments', label: 'Departments' },
  ];

  const handleBack = () => {
    navigate('/user-management');
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
                  User Management Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure employee types, locations, designations, and departments
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tabs Navigation - Responsive */}
        <SettingsTabsNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Contents */}
        <div className="px-4 py-6">
          <TabsContent value="employee-types" className="mt-0">
            <EmployeeTypesTab />
          </TabsContent>

          <TabsContent value="work-locations" className="mt-0">
            <WorkLocationsTab />
          </TabsContent>

          <TabsContent value="designations" className="mt-0">
            <DesignationsTab />
          </TabsContent>

          <TabsContent value="departments" className="mt-0">
            <DepartmentsTab />
          </TabsContent>
        </div>
      </Tabs>
    </PageLayout>
  );
}
