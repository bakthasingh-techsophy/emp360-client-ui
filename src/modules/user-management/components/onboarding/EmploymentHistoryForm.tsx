/**
 * Employment History Form
 * Previous work experience with modal-based creation
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { EmploymentHistory, EmploymentHistoryItem } from '../../types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Briefcase, Calendar as CalendarIcon, MapPin, Edit2, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timeline } from '@/components/timeline/Timeline';

// Zod schema for EmploymentHistory validation
export const employmentHistorySchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    employeeId: z.string(),
    companyName: z.string(),
    role: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    tenure: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })),
});

interface EmploymentHistoryFormProps {
  form: UseFormReturn<EmploymentHistory>;
  employeeId?: string;
}

export function EmploymentHistoryFormComponent({ employeeId }: EmploymentHistoryFormProps) {
  const { refreshEmploymentHistory, createEmploymentHistory, updateEmploymentHistory, deleteEmploymentHistoryById } = useUserManagement();
  
  const [items, setItems] = useState<EmploymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmploymentHistoryItem | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Modal form state
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const fetchEmploymentHistory = async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    try {
      const filters = [
        { id: 'employeeId', filterId: 'employeeId', operator: 'eq', value: employeeId }
      ];
      const data = await refreshEmploymentHistory(filters, '', 0, 100);
      if (data && data.content) {
        // Items are already sorted by backend (startDate desc)
        setItems(data.content as any);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentHistory();
  }, [employeeId]);

  const calculateTenure = (start: Date | undefined, end: Date | undefined): string => {
    if (!start || !end) return '';
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = Math.floor((diffDays % 365) % 30);
    
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0 && years === 0) parts.push(`${days}d`);
    
    return parts.length > 0 ? parts.join(' ') : '0d';
  };

  const handleOpenModal = (item?: EmploymentHistoryItem) => {
    if (item) {
      setEditingItem(item);
      setCompanyName(item.companyName);
      setRole(item.role);
      setLocation(item.location);
      setStartDate(item.startDate ? new Date(item.startDate) : undefined);
      setEndDate(item.endDate ? new Date(item.endDate) : undefined);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setCompanyName('');
    setRole('');
    setLocation('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartDateOpen(false);
    setEndDateOpen(false);
  };

  const handleSave = async () => {
    if (!employeeId || !startDate || !endDate) return;

    const tenure = calculateTenure(startDate, endDate);
    const order = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) + 1 : 1;
    
    if (editingItem && editingItem.id) {
      // Update existing - use record (plain object)
      await updateEmploymentHistory(editingItem.id, {
        companyName,
        role,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tenure,
      });
    } else {
      // Create new - use carrier
      await createEmploymentHistory({
        employeeId,
        companyName,
        role,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tenure,
        order,
        createdAt: new Date().toISOString(),
      });
    }

    await fetchEmploymentHistory();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    await deleteEmploymentHistoryById(id);
    await fetchEmploymentHistory();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading employment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Track your previous work experience
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Employment' : 'Add Employment'}
              </DialogTitle>
              <DialogDescription>
                Add details about your previous employment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Tech Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bangalore, India"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setStartDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setEndDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {startDate && endDate && (
                <div className="text-sm text-muted-foreground">
                  Tenure: {calculateTenure(startDate, endDate)}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!companyName || !role || !location || !startDate || !endDate}
              >
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No employment history added yet</p>
          <p className="text-sm mt-2">Click "Add Employment" to add your work experience</p>
        </div>
      ) : (
        <>
          {/* Desktop Timeline View - hidden on mobile */}
          <div className="hidden md:block">
            <Timeline
              items={items.map(item => ({
                id: item.id || '',
                type: 'employment',
                timestamp: new Date(item.startDate),
                data: item,
              }))}
              typeConfigs={[
                {
                  type: 'employment',
                  renderer: (timelineItem) => {
                    const item = timelineItem.data as EmploymentHistoryItem;
                    return (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  #{item.order || 0}
                                </Badge>
                                <h4 className="font-semibold">{item.role}</h4>
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">{item.companyName}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                                </div>
                              </div>
                              {item.tenure && (
                                <Badge variant="secondary">{item.tenure}</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal(item)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => item.id && handleDelete(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  },
                  icon: { component: Briefcase },
                  color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' },
                },
              ]}
              autoSort={false}
            />
          </div>

          {/* Mobile Card List - shown on small screens */}
          <div className="md:hidden space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{item.order || 0}
                        </Badge>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">{item.role}</h4>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{item.companyName}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                        </div>
                      </div>
                      {item.tenure && (
                        <Badge variant="secondary" className="text-xs">{item.tenure}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(item)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => item.id && handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
