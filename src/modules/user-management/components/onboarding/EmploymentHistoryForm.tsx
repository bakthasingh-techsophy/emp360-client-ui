/**
 * Employment History Form
 * Previous work experience with timeline and table views
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmploymentHistoryForm, EmploymentHistoryItem } from '../../types/onboarding.types';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineItem, TimelineTypeConfig } from '@/components/timeline/types';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable/EditableItemsTable';
import { Briefcase, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmploymentHistoryFormProps {
  form: UseFormReturn<EmploymentHistoryForm>;
}

export function EmploymentHistoryFormComponent({ form }: EmploymentHistoryFormProps) {
  const { watch, setValue } = form;
  
  const items = watch('items') || [];
  const viewMode = watch('viewMode') || 'timeline';
  const [activeView, setActiveView] = useState<'timeline' | 'edit'>(viewMode);

  // Table columns configuration
  const columns: TableColumn<EmploymentHistoryItem>[] = [
    {
      key: 'companyName',
      header: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Tech Corp',
      flex: 2,
    },
    {
      key: 'role',
      header: 'Role',
      type: 'text',
      required: true,
      placeholder: 'e.g., Software Engineer',
      flex: 2,
    },
    {
      key: 'location',
      header: 'Location',
      type: 'text',
      required: true,
      placeholder: 'e.g., Bangalore',
      flex: 1,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      type: 'date',
      required: true,
      width: '150px',
    },
    {
      key: 'endDate',
      header: 'End Date',
      type: 'date',
      required: true,
      width: '150px',
    },
  ];

  const emptyItem: EmploymentHistoryItem = {
    id: '',
    companyName: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    tenure: '',
  };

  // Calculate tenure
  const calculateTenure = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  // Handle items change and calculate tenure
  const handleItemsChange = (newItems: EmploymentHistoryItem[]) => {
    const itemsWithTenure = newItems.map(item => ({
      ...item,
      tenure: calculateTenure(item.startDate, item.endDate),
    }));
    setValue('items', itemsWithTenure);
  };

  // Timeline configuration
  const timelineItems: TimelineItem[] = items.map((item) => ({
    id: item.id || `emp-${Date.now()}-${Math.random()}`,
    type: 'employment',
    timestamp: new Date(item.startDate),
    data: item,
  }));

  const timelineConfig: TimelineTypeConfig[] = [
    {
      type: 'employment',
      renderer: (item) => {
        const data = item.data as EmploymentHistoryItem;
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{data.role}</h4>
                    <p className="text-muted-foreground">{data.companyName}</p>
                  </div>
                  <Badge variant="secondary">{data.tenure}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(data.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(data.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{data.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      },
      icon: {
        component: Briefcase,
      },
      color: {
        dot: 'bg-purple-500/10',
        iconColor: 'text-purple-600',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Add your previous work experience
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="edit">Edit Mode</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employment history added yet</p>
              <p className="text-sm mt-2">Switch to Edit Mode to add your work experience</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveView('edit')}
              >
                Add Employment History
              </Button>
            </div>
          ) : (
            <Timeline
              items={timelineItems}
              typeConfigs={timelineConfig}
              emptyMessage="No employment history"
              sortOrder="desc"
            />
          )}
        </TabsContent>

        {/* Edit Mode */}
        <TabsContent value="edit" className="mt-6">
          <EditableItemsTable
            columns={columns}
            items={items}
            onChange={handleItemsChange}
            emptyItemTemplate={emptyItem}
            minItems={0}
            maxItems={10}
          />
          {items.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setActiveView('timeline')}
              >
                View Timeline
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
