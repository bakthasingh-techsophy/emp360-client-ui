/**
 * Expense Settings Page
 * Central configuration page for expense management system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/components/PageLayout';
import { ExpenseSettingsTabsNavigation } from './ExpenseSettingsTabsNavigation';
import { ExpenseTypesTab } from './ExpenseTypesTab';
import { ExpenseCategoriesTab } from './ExpenseCategoriesTab';

export interface SettingsTab {
  key: string;
  label: string;
}

export function ExpenseSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');

  const tabs: SettingsTab[] = [
    { key: 'types', label: 'Expense Types' },
    { key: 'categories', label: 'Expense Categories' },
  ];

  const handleBack = () => {
    navigate('/expense-management');
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
                    Expense Settings
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Configure expense types and categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Navigation - Responsive */}
          <ExpenseSettingsTabsNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Contents */}
          <div className="px-4 py-6">
            <TabsContent value="types" className="mt-0">
              <ExpenseTypesTab />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <ExpenseCategoriesTab />
            </TabsContent>
          </div>
        </Tabs>
      </PageLayout>
  );
}
