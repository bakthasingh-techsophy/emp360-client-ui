/**
 * Journey Card Component - Accordion Version
 * Accordion-based card for maximum space efficiency
 * Shows journey overview by default, expands to show cost breakdown
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JourneySegment, JourneyCostBreakdown } from '../types/intimation.types';
import { format, parseISO } from 'date-fns';

interface JourneyCardProps {
  segment: JourneySegment;
  index: number;
  onSave: (segment: JourneySegment) => void;
  onDelete: (segmentId: string) => void;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}
export function JourneyCard({ segment, index, onSave, onDelete, expanded, onExpandChange }: JourneyCardProps) {
  const [isEditing, setIsEditing] = useState(!segment.isSaved);
  const [editedSegment, setEditedSegment] = useState<JourneySegment>({ ...segment });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total cost from breakdown
  const calculateTotal = (breakdown: JourneyCostBreakdown): number => {
    return (
      Number(breakdown.transport || 0) +
      Number(breakdown.accommodation || 0) +
      Number(breakdown.food || 0) +
      Number(breakdown.miscellaneous || 0)
    );
  };

  // Update cost breakdown field
  const updateCostBreakdown = (field: keyof JourneyCostBreakdown, value: number) => {
    const newBreakdown = {
      ...editedSegment.costBreakdown,
      [field]: value,
    };
    const total = calculateTotal(newBreakdown);
    setEditedSegment({
      ...editedSegment,
      costBreakdown: newBreakdown,
      totalCost: total,
    });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedSegment.from?.trim()) {
      newErrors.from = 'From location is required';
    }
    if (!editedSegment.to?.trim()) {
      newErrors.to = 'To location is required';
    }
    if (!editedSegment.fromDate) {
      newErrors.fromDate = 'From date is required';
    }
    if (!editedSegment.toDate) {
      newErrors.toDate = 'To date is required';
    }
    if (editedSegment.fromDate && editedSegment.toDate) {
      const fromDate = new Date(editedSegment.fromDate);
      const toDate = new Date(editedSegment.toDate);
      if (toDate < fromDate) {
        newErrors.toDate = 'To date must be after from date';
      }
    }
    if (!editedSegment.modeOfTransport) {
      newErrors.modeOfTransport = 'Transport mode is required';
    }
    if (editedSegment.totalCost <= 0) {
      newErrors.totalCost = 'At least one cost must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave({
      ...editedSegment,
      isSaved: true,
      isEditing: false,
    });
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (!segment.isSaved) {
      // If never saved, delete it
      onDelete(segment.id);
    } else {
      // Restore original values
      setEditedSegment({ ...segment });
      setErrors({});
      setIsEditing(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setEditedSegment({ ...segment });
    setErrors({});
    setIsEditing(true);
  };

  // Format date for display - short format
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM');
    } catch {
      return dateStr;
    }
  };

  // Get transport mode label
  const getTransportLabel = (mode: string) => {
    const labels: Record<string, string> = {
      flight: 'Flight',
      train: 'Train',
      bus: 'Bus',
      car: 'Car',
      taxi: 'Taxi/Cab',
      metro: 'Metro',
      ship: 'Ship/Ferry',
      other: 'Other',
    };
    return labels[mode] || mode;
  };

  return (
    <Card className={`${!segment.isSaved ? 'border-dashed' : ''} bg-muted/30`}>
      <CardContent className="p-0">
        {isEditing ? (
          // Edit Mode - Compact Form
          <div className="p-4 space-y-4 bg-background rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Journey {index + 1}</span>
                {!segment.isSaved && (
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total Cost</div>
                <div className="text-lg font-bold text-primary">
                  ${editedSegment.totalCost.toFixed(2)}
                </div>
                {errors.totalCost && (
                  <div className="text-xs text-destructive mt-0.5">{errors.totalCost}</div>
                )}
              </div>
            </div>

            {/* Journey & Dates Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`from-${index}`} className="text-xs">From Location</Label>
                <Input
                  id={`from-${index}`}
                  value={editedSegment.from}
                  onChange={(e) =>
                    setEditedSegment({ ...editedSegment, from: e.target.value })
                  }
                  placeholder="Enter location"
                  className={`text-sm ${errors.from ? 'border-destructive' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`to-${index}`} className="text-xs">To Location</Label>
                <Input
                  id={`to-${index}`}
                  value={editedSegment.to}
                  onChange={(e) =>
                    setEditedSegment({ ...editedSegment, to: e.target.value })
                  }
                  placeholder="Enter location"
                  className={`text-sm ${errors.to ? 'border-destructive' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !editedSegment.fromDate && "text-muted-foreground",
                        errors.fromDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedSegment.fromDate ? format(parseISO(editedSegment.fromDate), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedSegment.fromDate ? parseISO(editedSegment.fromDate) : undefined}
                      onSelect={(date) =>
                        setEditedSegment({ ...editedSegment, fromDate: date ? format(date, 'yyyy-MM-dd') : '' })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !editedSegment.toDate && "text-muted-foreground",
                        errors.toDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedSegment.toDate ? format(parseISO(editedSegment.toDate), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedSegment.toDate ? parseISO(editedSegment.toDate) : undefined}
                      onSelect={(date) =>
                        setEditedSegment({ ...editedSegment, toDate: date ? format(date, 'yyyy-MM-dd') : '' })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Transport & Cost Breakdown Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label className="text-xs">Mode of Transport</Label>
                <Select
                  value={editedSegment.modeOfTransport}
                  onValueChange={(value) =>
                    setEditedSegment({ ...editedSegment, modeOfTransport: value })
                  }
                >
                  <SelectTrigger className={`text-sm ${errors.modeOfTransport ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="ship">Ship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`transport-cost-${index}`} className="text-xs">Transport Cost</Label>
                <Input
                  id={`transport-cost-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedSegment.costBreakdown.transport}
                  onChange={(e) =>
                    updateCostBreakdown('transport', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`accommodation-cost-${index}`} className="text-xs">Accommodation</Label>
                <Input
                  id={`accommodation-cost-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedSegment.costBreakdown.accommodation}
                  onChange={(e) =>
                    updateCostBreakdown('accommodation', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`food-cost-${index}`} className="text-xs">Food Cost</Label>
                <Input
                  id={`food-cost-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedSegment.costBreakdown.food}
                  onChange={(e) =>
                    updateCostBreakdown('food', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`misc-cost-${index}`} className="text-xs">Miscellaneous</Label>
                <Input
                  id={`misc-cost-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedSegment.costBreakdown.miscellaneous}
                  onChange={(e) =>
                    updateCostBreakdown('miscellaneous', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>

            {/* Validation Errors */}
            {Object.keys(errors).length > 0 && (
              <div className="text-xs text-destructive">
                {errors.from && <div>• From location required</div>}
                {errors.to && <div>• To location required</div>}
                {errors.fromDate && <div>• From date required</div>}
                {errors.toDate && errors.toDate !== errors.totalCost && <div>• {errors.toDate}</div>}
                {errors.modeOfTransport && <div>• Transport mode required</div>}
              </div>
            )}
          </div>
        ) : (
          // View Mode - Accordion
          <Accordion
            type="single"
            collapsible
            value={expanded ? `item-${segment.id}` : ''}
            onValueChange={(value) => onExpandChange(!!value)}
          >
            <AccordionItem value={`item-${segment.id}`} className="border-none">
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Journey Summary */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-semibold shrink-0">J{index + 1}</span>
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <Check className="h-3 w-3" />
                  </Badge>
                  <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                    <span className="font-medium truncate">{segment.from}</span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="font-medium truncate">{segment.to}</span>
                    <span className="text-muted-foreground shrink-0 hidden sm:inline">•</span>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                      {formatDate(segment.fromDate)} - {formatDate(segment.toDate)}
                    </span>
                    <span className="text-muted-foreground shrink-0 hidden md:inline">•</span>
                    <span className="text-xs shrink-0 hidden md:inline">
                      {getTransportLabel(segment.modeOfTransport)}
                    </span>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-primary">
                    ${segment.totalCost.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(segment.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  {/* Expand/Collapse Indicator */}
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </AccordionTrigger>
                </div>
              </div>

              {/* Cost Breakdown - Shown when expanded */}
              <AccordionContent className="px-4 pb-3">
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Transport</span>
                      <span className="font-medium">
                        ${segment.costBreakdown.transport.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Accommodation</span>
                      <span className="font-medium">
                        ${segment.costBreakdown.accommodation.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Food</span>
                      <span className="font-medium">
                        ${segment.costBreakdown.food.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Miscellaneous</span>
                      <span className="font-medium">
                        ${segment.costBreakdown.miscellaneous.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info Row */}
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="sm:hidden">
                        {formatDate(segment.fromDate)} - {formatDate(segment.toDate)}
                      </span>
                      <span className="md:hidden sm:inline">
                        {getTransportLabel(segment.modeOfTransport)}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
