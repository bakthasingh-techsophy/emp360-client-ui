/**
 * Event History Form (formerly Promotion/Revision History)
 * Timeline of employee events: promotions, demotions, transfers, role changes, joining, resignation, etc.
 * Features: Manual entry, reorderable cards, view/edit modes
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventHistoryForm, EventHistoryItem } from '../../types/onboarding.types';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineItem, TimelineTypeConfig } from '@/components/timeline/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TrendingUp, TrendingDown, ArrowRightLeft, Briefcase, Plus, GripVertical, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionHistoryFormProps {
  form: UseFormReturn<EventHistoryForm>;
}

// Dummy data for demonstration
const dummyEvents: EventHistoryItem[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'joining',
    oldRole: '',
    newRole: 'Junior Software Engineer',
    oldDepartment: '',
    newDepartment: 'Engineering',
    reason: 'Joined the company',
    effectiveDate: '2024-01-15',
    order: 1,
  },
  {
    id: '2',
    date: '2024-06-01',
    type: 'promotion',
    oldRole: 'Junior Software Engineer',
    newRole: 'Software Engineer',
    oldDepartment: 'Engineering',
    newDepartment: 'Engineering',
    reason: 'Excellent performance and consistent delivery',
    effectiveDate: '2024-06-01',
    order: 2,
  },
  {
    id: '3',
    date: '2025-01-10',
    type: 'promotion',
    oldRole: 'Software Engineer',
    newRole: 'Senior Software Engineer',
    oldDepartment: 'Engineering',
    newDepartment: 'Engineering',
    reason: 'Leadership skills and technical expertise',
    effectiveDate: '2025-01-10',
    order: 3,
  },
  {
    id: '4',
    date: '2025-09-15',
    type: 'transfer',
    oldRole: 'Senior Software Engineer',
    newRole: 'Senior Software Engineer',
    oldDepartment: 'Engineering',
    newDepartment: 'Product Development',
    reason: 'Department restructuring',
    effectiveDate: '2025-09-15',
    order: 4,
  },
];

export function PromotionHistoryFormComponent({ form }: PromotionHistoryFormProps) {
  const { watch, setValue } = form;
  
  const items = watch('items') || dummyEvents; // Use dummy data if empty
  const [activeView, setActiveView] = useState<'timeline' | 'edit'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventHistoryItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Form state for modal
  const [eventType, setEventType] = useState<EventHistoryItem['type']>('promotion');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined);
  const [oldRole, setOldRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [oldDepartment, setOldDepartment] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [reason, setReason] = useState('');

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'promotion': 'Promotion',
      'demotion': 'Demotion',
      'transfer': 'Transfer',
      'role-change': 'Role Change',
      'joining': 'Joining',
      'resignation': 'Resignation',
      'other': 'Other',
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (type) {
      case 'promotion':
      case 'joining':
        return 'default';
      case 'demotion':
      case 'resignation':
        return 'destructive';
      case 'transfer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return TrendingUp;
      case 'demotion':
        return TrendingDown;
      case 'transfer':
        return ArrowRightLeft;
      case 'joining':
        return UserPlus;
      case 'resignation':
        return UserMinus;
      default:
        return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotion':
        return { dot: 'bg-green-500/10', iconColor: 'text-green-600' };
      case 'demotion':
        return { dot: 'bg-red-500/10', iconColor: 'text-red-600' };
      case 'transfer':
        return { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' };
      case 'joining':
        return { dot: 'bg-purple-500/10', iconColor: 'text-purple-600' };
      case 'resignation':
        return { dot: 'bg-orange-500/10', iconColor: 'text-orange-600' };
      default:
        return { dot: 'bg-gray-500/10', iconColor: 'text-gray-600' };
    }
  };

  const handleOpenModal = (event?: EventHistoryItem) => {
    if (event) {
      setEditingEvent(event);
      setEventType(event.type);
      setEventDate(new Date(event.date));
      setEffectiveDate(new Date(event.effectiveDate));
      setOldRole(event.oldRole);
      setNewRole(event.newRole);
      setOldDepartment(event.oldDepartment || '');
      setNewDepartment(event.newDepartment || '');
      setReason(event.reason);
    } else {
      setEditingEvent(null);
      setEventType('promotion');
      setEventDate(undefined);
      setEffectiveDate(undefined);
      setOldRole('');
      setNewRole('');
      setOldDepartment('');
      setNewDepartment('');
      setReason('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = () => {
    if (!eventDate || !effectiveDate || !newRole) return;

    const newEvent: EventHistoryItem = {
      id: editingEvent?.id || `event-${Date.now()}`,
      date: eventDate.toISOString(),
      type: eventType,
      oldRole,
      newRole,
      oldDepartment,
      newDepartment,
      reason,
      effectiveDate: effectiveDate.toISOString(),
      order: editingEvent?.order || items.length + 1,
    };

    let updatedItems;
    if (editingEvent) {
      updatedItems = items.map((item) => (item.id === editingEvent.id ? newEvent : item));
    } else {
      updatedItems = [...items, newEvent];
    }

    setValue('items', updatedItems);
    handleCloseModal();
  };

  const handleDeleteEvent = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    // Reorder remaining items
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setValue('items', reorderedItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Update order
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setValue('items', reorderedItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Sort items by order for display
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // Timeline configuration
  const timelineItems: TimelineItem[] = sortedItems.map((item) => ({
    id: item.id,
    type: item.type,
    timestamp: new Date(item.effectiveDate),
    data: item,
  }));

  const timelineConfigs: TimelineTypeConfig[] = [
    'promotion',
    'demotion',
    'transfer',
    'role-change',
    'joining',
    'resignation',
    'other',
  ].map((type) => ({
    type,
    renderer: (item) => {
      const data = item.data as EventHistoryItem;
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={getTypeVariant(data.type)}>
                    {getTypeLabel(data.type)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(data.effectiveDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {data.oldRole && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{data.oldRole}</span>
                    <span>→</span>
                    <span className="font-semibold">{data.newRole}</span>
                  </div>
                )}
                {!data.oldRole && data.newRole && (
                  <div className="text-sm font-semibold">{data.newRole}</div>
                )}
                {data.oldDepartment && data.newDepartment && data.oldDepartment !== data.newDepartment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{data.oldDepartment}</span>
                    <span>→</span>
                    <span>{data.newDepartment}</span>
                  </div>
                )}
                {data.reason && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.reason}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
    icon: { component: getTypeIcon(type) },
    color: getTypeColor(type),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Career progression and all employee events timeline
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="edit">Edit Mode</TabsTrigger>
          </TabsList>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                <DialogDescription>
                  Record employee career events, promotions, transfers, and other milestones
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="demotion">Demotion</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="role-change">Role Change</SelectItem>
                        <SelectItem value="joining">Joining</SelectItem>
                        <SelectItem value="resignation">Resignation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <DatePicker
                      date={eventDate}
                      onSelect={setEventDate}
                      placeholder="Select date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <DatePicker
                    date={effectiveDate}
                    onSelect={setEffectiveDate}
                    placeholder="Select effective date"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Previous Role</Label>
                    <Input
                      value={oldRole}
                      onChange={(e) => setOldRole(e.target.value)}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Role <span className="text-destructive">*</span></Label>
                    <Input
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                </div>
                {(eventType === 'transfer' || eventType === 'joining') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Previous Department</Label>
                      <Input
                        value={oldDepartment}
                        onChange={(e) => setOldDepartment(e.target.value)}
                        placeholder="e.g., Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Department</Label>
                      <Input
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        placeholder="e.g., Product Development"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Reason / Description</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for this event"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEvent}
                  disabled={!eventDate || !effectiveDate || !newRole}
                >
                  {editingEvent ? 'Update' : 'Add'} Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No event history recorded yet</p>
              <p className="text-sm mt-2">Click 'Add Event' to record employee milestones</p>
            </div>
          ) : (
            <Timeline
              items={timelineItems}
              typeConfigs={timelineConfigs}
              emptyMessage="No event history"
              sortOrder="desc"
            />
          )}
        </TabsContent>

        {/* Edit Mode */}
        <TabsContent value="edit" className="mt-6">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No event history recorded yet</p>
              <p className="text-sm mt-2">Click 'Add Event' to start</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Drag cards to reorder events. Changes will reflect in the timeline view.
              </p>
              {sortedItems.map((event, index) => {
                const Icon = getTypeIcon(event.type);
                return (
                  <Card
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-move transition-opacity',
                      draggedIndex === index && 'opacity-50'
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className={cn('h-5 w-5', getTypeColor(event.type).iconColor)} />
                              <div>
                                <Badge variant={getTypeVariant(event.type)}>
                                  {getTypeLabel(event.type)}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Date(event.effectiveDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(event)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {event.oldRole && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">{event.oldRole}</span>
                                <span>→</span>
                                <span className="font-semibold">{event.newRole}</span>
                              </div>
                            )}
                            {!event.oldRole && event.newRole && (
                              <div className="text-sm font-semibold">{event.newRole}</div>
                            )}
                            {event.oldDepartment && event.newDepartment && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{event.oldDepartment}</span>
                                <span>→</span>
                                <span>{event.newDepartment}</span>
                              </div>
                            )}
                            {event.reason && (
                              <p className="text-sm text-muted-foreground">{event.reason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
