/**
 * Event History Form (formerly Promotion/Revision History)
 * Timeline of employee events: promotions, demotions, transfers, role changes, joining, resignation, etc.
 * Features: Manual entry, reorderable cards, view/edit modes
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventHistoryForm, EventHistoryItem, EventType } from '../../types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';
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
  employeeId?: string;
}

export function PromotionHistoryFormComponent({ form, employeeId }: PromotionHistoryFormProps) {
  const { watch, setValue } = form;
  const { searchEventHistory } = useUserManagement();
  
  const items = watch('items') || [];
  const [activeView, setActiveView] = useState<'timeline' | 'edit'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventHistoryItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Form state for modal
  const [eventType, setEventType] = useState<EventType>(EventType.PROMOTION);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined);
  const [oldRole, setOldRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [oldDepartment, setOldDepartment] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [modalErrors, setModalErrors] = useState<string[]>([]);

  const fetchEventHistory = async () => {
    if (employeeId) {
      const searchRequest = buildUniversalSearchRequest(
        [{ id: 'employeeId-filter', filterId: 'employeeId', operator: 'eq', value: employeeId }]
      );
      const data = await searchEventHistory(searchRequest, 0, 100);
      if (data && data.content) {
        setValue('items', data.content as any);
      }
    }
  };

  useEffect(() => {
    fetchEventHistory();
  }, [employeeId]);

  const getTypeLabel = (type: EventType) => {
    const labels: Record<EventType, string> = {
      [EventType.PROMOTION]: 'Promotion',
      [EventType.DEMOTION]: 'Demotion',
      [EventType.TRANSFER]: 'Transfer',
      [EventType.ROLE_CHANGE]: 'Role Change',
      [EventType.JOINING]: 'Joining',
      [EventType.RESIGNATION]: 'Resignation',
      [EventType.OTHER]: 'Other',
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type: EventType): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (type) {
      case EventType.PROMOTION:
      case EventType.JOINING:
        return 'default';
      case EventType.DEMOTION:
      case EventType.RESIGNATION:
        return 'destructive';
      case EventType.TRANSFER:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.PROMOTION:
        return TrendingUp;
      case EventType.DEMOTION:
        return TrendingDown;
      case EventType.TRANSFER:
        return ArrowRightLeft;
      case EventType.JOINING:
        return UserPlus;
      case EventType.RESIGNATION:
        return UserMinus;
      default:
        return Briefcase;
    }
  };

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.PROMOTION:
        return { dot: 'bg-green-500/10', iconColor: 'text-green-600' };
      case EventType.DEMOTION:
        return { dot: 'bg-red-500/10', iconColor: 'text-red-600' };
      case EventType.TRANSFER:
        return { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' };
      case EventType.JOINING:
        return { dot: 'bg-purple-500/10', iconColor: 'text-purple-600' };
      case EventType.RESIGNATION:
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
      setEventType(EventType.PROMOTION);
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
    // Validate required fields
    const errors: string[] = [];
    if (!eventDate) errors.push('Event date is required');
    if (!effectiveDate) errors.push('Effective date is required');
    if (!newRole || newRole.trim() === '') errors.push('New role is required');
    
    if (errors.length > 0) {
      setModalErrors(errors);
      return;
    }
    
    setModalErrors([]);

    const newEvent: EventHistoryItem = {
      id: editingEvent?.id || `event-${Date.now()}`,
      employeeId: employeeId || '',
      date: eventDate?.toISOString() || new Date().toISOString(),
      type: eventType,
      oldRole,
      newRole,
      oldDepartment,
      newDepartment,
      reason,
      effectiveDate: effectiveDate?.toISOString() || new Date().toISOString(),
      order: editingEvent?.order || items.length + 1,
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedItems;
    if (editingEvent) {
      updatedItems = items.map((item: EventHistoryItem) => (item.id === editingEvent.id ? newEvent : item));
    } else {
      updatedItems = [...items, newEvent];
    }

    setValue('items', updatedItems);
    handleCloseModal();
  };

  const handleDeleteEvent = (id: string) => {
    const updatedItems = items.filter((item: EventHistoryItem) => item.id !== id);
    // Reorder remaining items
    const reorderedItems = updatedItems.map((item: EventHistoryItem, index: number) => ({
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
    EventType.PROMOTION,
    EventType.DEMOTION,
    EventType.TRANSFER,
    EventType.ROLE_CHANGE,
    EventType.JOINING,
    EventType.RESIGNATION,
    EventType.OTHER,
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
              {modalErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                    {modalErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EventType.PROMOTION}>Promotion</SelectItem>
                        <SelectItem value={EventType.DEMOTION}>Demotion</SelectItem>
                        <SelectItem value={EventType.TRANSFER}>Transfer</SelectItem>
                        <SelectItem value={EventType.ROLE_CHANGE}>Role Change</SelectItem>
                        <SelectItem value={EventType.JOINING}>Joining</SelectItem>
                        <SelectItem value={EventType.RESIGNATION}>Resignation</SelectItem>
                        <SelectItem value={EventType.OTHER}>Other</SelectItem>
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
                {(eventType === EventType.TRANSFER || eventType === EventType.JOINING) && (
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
                <Button variant="outline" onClick={() => {
                  handleCloseModal();
                  setModalErrors([]);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent}>
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
