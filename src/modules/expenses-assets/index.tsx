/**
 * Expense Management Module
 * Combined view showing all dashboards together
 */

import React from 'react';
import { EmployeeExpenseList } from './EmployeeExpenseList';
import { ApprovalDashboard } from './ApprovalDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExpenseManagement: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Expense Management</h1>
      <Tabs defaultValue="employee">
        <TabsList>
          <TabsTrigger value="employee">My Expenses</TabsTrigger>
          <TabsTrigger value="level1">Manager Dashboard</TabsTrigger>
          <TabsTrigger value="level2">Business Dashboard</TabsTrigger>
          <TabsTrigger value="level3">Finance Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee">
          <EmployeeExpenseList />
        </TabsContent>
        
        <TabsContent value="level1">
          <ApprovalDashboard level="level1" />
        </TabsContent>
        
        <TabsContent value="level2">
          <ApprovalDashboard level="level2" />
        </TabsContent>
        
        <TabsContent value="level3">
          <ApprovalDashboard level="level3" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseManagement;
