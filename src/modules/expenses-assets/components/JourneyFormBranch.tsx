/**
 * Journey Form Branch Component
 * Accordion-based form for travel intimations with cost breakdown
 * Each journey is independently editable and expandable
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JourneySegment, JourneyCostBreakdown } from '../types/intimation.types';
import { JourneyCard } from './JourneyCard';
import { format } from 'date-fns';
import { AlertCircle, Plus, ChevronsDown, ChevronsUp } from 'lucide-react';

interface JourneyFormBranchProps {
  value: JourneySegment[];
  onChange: (segments: JourneySegment[]) => void;
}

export interface JourneyFormBranchRef {
  validate: () => boolean;
  clearErrors: () => void;
}

export const JourneyFormBranch = forwardRef<JourneyFormBranchRef, JourneyFormBranchProps>(
  ({ value, onChange }, ref) => {
    const segments = value;
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Calculate total cost for all journeys
    const getTotalEstimatedCost = () => {
      return segments.reduce((sum, seg) => sum + Number(seg.totalCost || 0), 0);
    };

    // Count saved journeys
    const getSavedJourneysCount = () => {
      return segments.filter((seg) => seg.isSaved).length;
    };

    // Expand all journeys
    const handleExpandAll = () => {
      const allIds = segments.filter(seg => seg.isSaved).map(seg => seg.id);
      setExpandedItems(new Set(allIds));
    };

    // Collapse all journeys
    const handleCollapseAll = () => {
      setExpandedItems(new Set());
    };

    // Handle individual journey expand/collapse
    const handleExpandChange = (segmentId: string, expanded: boolean) => {
      const newExpanded = new Set(expandedItems);
      if (expanded) {
        newExpanded.add(segmentId);
      } else {
        newExpanded.delete(segmentId);
      }
      setExpandedItems(newExpanded);
    };

    // Validate all journeys
    const validateSegments = (): boolean => {
      // Check if there's at least one journey
      if (segments.length === 0) {
        setErrorMessage('Please add at least one journey');
        return false;
      }

      // Check if all journeys are saved
      const unsavedCount = segments.filter((seg) => !seg.isSaved).length;
      if (unsavedCount > 0) {
        setErrorMessage(
          `Please save all journeys before submitting (${unsavedCount} unsaved)`
        );
        return false;
      }

      // Check if at least one journey has cost
      const totalCost = getTotalEstimatedCost();
      if (totalCost <= 0) {
        setErrorMessage('At least one journey must have estimated costs');
        return false;
      }

      setErrorMessage('');
      return true;
    };

    // Expose validation methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate: () => {
        return validateSegments();
      },
      clearErrors: () => {
        setErrorMessage('');
      },
    }));

    // Handle journey save
    const handleSaveJourney = (updatedSegment: JourneySegment) => {
      const updatedSegments = segments.map((seg) =>
        seg.id === updatedSegment.id ? updatedSegment : seg
      );
      onChange(updatedSegments);
      setErrorMessage(''); // Clear errors when a journey is saved
    };

    // Handle journey delete
    const handleDeleteJourney = (segmentId: string) => {
      const updatedSegments = segments.filter((seg) => seg.id !== segmentId);
      onChange(updatedSegments);
      
      // If deleting the last journey, clear errors
      if (updatedSegments.length === 0) {
        setErrorMessage('');
      }
    };

    // Add new journey
    const handleAddJourney = () => {
      const newSegment: JourneySegment = {
        id: `journey-${Date.now()}`,
        from: '',
        to: '',
        fromDate: format(new Date(), 'yyyy-MM-dd'),
        toDate: format(new Date(), 'yyyy-MM-dd'),
        modeOfTransport: '',
        notes: '',
        costBreakdown: {
          transport: 0,
          accommodation: 0,
          food: 0,
          miscellaneous: 0,
        } as JourneyCostBreakdown,
        totalCost: 0,
        isEditing: true,
        isSaved: false,
      };
      onChange([...segments, newSegment]);
    };

    return (
      <div className="space-y-4">
        {/* Error Messages */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Main Journey Card - Contains Everything */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Header with Stats and Controls */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b">
              <div className="flex items-center gap-4 md:gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Journeys:</span>
                  <span className="ml-2 font-semibold">{segments.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Saved:</span>
                  <span className="ml-2 font-semibold">
                    {getSavedJourneysCount()}/{segments.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Expand/Collapse All Controls */}
                {getSavedJourneysCount() > 0 && (
                  <div className="flex gap-1 mr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandAll}
                      className="h-7 text-xs"
                    >
                      <ChevronsDown className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Expand All</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapseAll}
                      className="h-7 text-xs"
                    >
                      <ChevronsUp className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Collapse All</span>
                    </Button>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-xs text-muted-foreground mr-2">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    ${getTotalEstimatedCost().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Cards */}
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <JourneyCard
                  key={segment.id}
                  segment={segment}
                  index={index}
                  onSave={handleSaveJourney}
                  onDelete={handleDeleteJourney}
                  expanded={expandedItems.has(segment.id)}
                  onExpandChange={(expanded) => handleExpandChange(segment.id, expanded)}
                />
              ))}
            </div>

            {/* Add Journey Button */}
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddJourney}
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

JourneyFormBranch.displayName = 'JourneyFormBranch';
