/**
 * Expense Management Module
 * Role-based routing:
 * - Employee: EmployeeExpenseList
 * - Manager: ApprovalDashboard (Level 1)
 * - Business Head: ApprovalDashboard (Level 2)
 * - Finance: ApprovalDashboard (Level 3)
 * - Admin: All dashboards with tabs
 */

import React from 'react';
import { EmployeeExpenseList } from './EmployeeExpenseList';
import { ApprovalDashboard } from './ApprovalDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { currentUser } from './data/mockData';
import { UserRole } from './types/expense.types';

const ExpenseManagement: React.FC = () => {
  const userRole: UserRole = currentUser.role as UserRole;

  // Admin sees all dashboards
  if (userRole === 'admin') {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Expense Management (Admin)</h1>
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
            <ApprovalDashboard level="level1" userRole={userRole} />
          </TabsContent>
          
          <TabsContent value="level2">
            <ApprovalDashboard level="level2" userRole={userRole} />
          </TabsContent>
          
          <TabsContent value="level3">
            <ApprovalDashboard level="level3" userRole={userRole} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Finance sees Level 3 dashboard
  if (userRole === 'finance') {
    return <ApprovalDashboard level="level3" userRole={userRole} />;
  }

  // Business head sees Level 2 dashboard
  if (userRole === 'business_head') {
    return <ApprovalDashboard level="level2" userRole={userRole} />;
  }

  // Manager sees Level 1 dashboard
  if (userRole === 'manager') {
    return <ApprovalDashboard level="level1" userRole={userRole} />;
  }

  // Employee sees their expense list
  return <EmployeeExpenseList />;
};

export default ExpenseManagement;
