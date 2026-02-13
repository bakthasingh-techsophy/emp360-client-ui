/**
 * Intimation Approval Page
 * Dedicated page for approvers to review and take action on intimation requests
 * Allows viewing details, editing estimated costs, adding comments, and approving/rejecting
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { FormHeader } from '@/components/common/FormHeader';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockIntimations } from './data/mockData';
import { JourneyFormBranch, JourneyFormBranchRef } from './components/JourneyFormBranch';
import { OtherFormBranch } from './components/OtherFormBranch';
import { JourneySegment } from './types/intimation.types';
import { format } from 'date-fns';
import { User, Mail, Building2, Calendar, FileText, Plane, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IntimationApprovalPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const journeyFormRef = useRef<JourneyFormBranchRef>(null);

  // Find the intimation
  const intimation = mockIntimations.find(i => i.id === id);
  
  // State for editable data
  const [journeySegments, setJourneySegments] = useState<JourneySegment[]>(intimation?.journeySegments || []);
  const [description, setDescription] = useState(intimation?.description || '');
  const [approverComments, setApproverComments] = useState('');

  useEffect(() => {
    if (!intimation) {
      toast({
        title: 'Error',
        description: 'Intimation not found',
        variant: 'destructive',
      });
      navigate('/expense-management');
    }
  }, [intimation, navigate, toast]);

  if (!intimation) return null;

  // Calculate total from journey segments
  const calculateTotal = () => {
    if (intimation.type === 'travel') {
      return journeySegments.reduce((sum, segment) => sum + (Number(segment.estimatedCost) || 0), 0);
    }
    return intimation.estimatedTotalCost || 0;
  };

  // Handle approval
  const handleApprove = async () => {
    if (!approverComments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please add comments before approving',
        variant: 'destructive',
      });
      return;
    }

    // Validate journey segments if travel type
    if (intimation.type === 'travel' && journeyFormRef.current) {
      const isValid = journeyFormRef.current.validate();
      if (!isValid) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setIsSubmitting(true);
    console.log('Approving intimation:', {
      id: intimation.id,
      adjustedJourneySegments: journeySegments,
      adjustedTotal: calculateTotal(),
      approverComments,
      action: 'approved',
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Approved',
        description: 'Intimation has been approved successfully',
      });
      setIsSubmitting(false);
      navigate('/expense-management');
    }, 1000);
  };

  // Handle rejection
  const handleReject = async () => {
    if (!approverComments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please add comments explaining the rejection',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Rejecting intimation:', {
      id: intimation.id,
      approverComments,
      action: 'rejected',
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Rejected',
        description: 'Intimation has been rejected',
      });
      setIsSubmitting(false);
      navigate('/expense-management');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/expense-management');
  };

  // Info field component for displaying read-only information
  const InfoField = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );

  const originalTotal = intimation.estimatedTotalCost || 0;
  const adjustedTotal = calculateTotal();
  const hasAdjustments = originalTotal !== adjustedTotal;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'pending_approval':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      acknowledged: 'Acknowledged',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <PageLayout>
      <div className="flex justify-center px-2 sm:px-4 lg:px-6">
        <div className="w-full max-w-[min(100%,1400px)] space-y-6 pb-32">
          {/* Fixed Header */}
          <FormHeader
            title="Review & Take Action"
            description="Review the intimation details, adjust estimated costs if needed, and approve or reject with your comments"
            onBack={handleCancel}
          />

          {/* Intimation Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {intimation.intimationNumber}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={intimation.type === 'travel' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                      {intimation.type === 'travel' ? (
                        <>
                          <Plane className="h-3 w-3 mr-1" />
                          Travel
                        </>
                      ) : (
                        <>
                          <Package className="h-3 w-3 mr-1" />
                          Other
                        </>
                      )}
                    </Badge>
                    <Badge className={getStatusColor(intimation.status)}>
                      {getStatusLabel(intimation.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                  <div className="text-sm font-medium">
                    {intimation.submittedAt ? format(new Date(intimation.submittedAt), 'MMM dd, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField
                  icon={User}
                  label="Employee Name"
                  value={intimation.employeeName}
                />
                <InfoField
                  icon={Building2}
                  label="Employee ID"
                  value={intimation.employeeId}
                />
                <InfoField
                  icon={Mail}
                  label="Email"
                  value={intimation.employeeEmail}
                />
                <InfoField
                  icon={Building2}
                  label="Department"
                  value={intimation.department}
                />
                <InfoField
                  icon={Calendar}
                  label="Created On"
                  value={format(new Date(intimation.createdAt), 'MMM dd, yyyy')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Editable Intimation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Intimation Details - Review & Adjust
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {intimation.type === 'travel' ? (
                <JourneyFormBranch
                  ref={journeyFormRef}
                  value={journeySegments}
                  onChange={setJourneySegments}
                />
              ) : (
                <OtherFormBranch
                  value={description}
                  onChange={setDescription}
                />
              )}

              {/* Description (Read-only) */}
              {intimation.description && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Description (from submitter)</Label>
                  <div className="p-3 rounded-md bg-muted text-sm">
                    {intimation.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Original Estimated Total:</span>
                  <span className="font-medium">${originalTotal.toFixed(2)}</span>
                </div>
                {hasAdjustments && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Adjusted Estimated Total:</span>
                      <span className="font-medium">${adjustedTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Adjustment:</span>
                      <span className={`font-semibold ${adjustedTotal > originalTotal ? 'text-red-600' : 'text-green-600'}`}>
                        {adjustedTotal > originalTotal ? '+' : ''}${(adjustedTotal - originalTotal).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                {!hasAdjustments && (
                  <div className="text-xs text-muted-foreground">
                    No adjustments made to the estimated costs
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approver Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Comments *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your comments here (required for approval/rejection)..."
                value={approverComments}
                onChange={(e) => setApproverComments(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                These comments will be visible to the employee and recorded in the approval history.
              </p>
            </CardContent>
          </Card>

          {/* Fixed Action Bar */}
          <FormActionBar
            onCancel={handleCancel}
            customActions={[
              {
                id: 'cancel',
                label: 'Cancel',
                onClick: handleCancel,
                variant: 'outline',
                disabled: isSubmitting,
              },
              {
                id: 'reject',
                label: 'Reject',
                onClick: handleReject,
                variant: 'destructive',
                disabled: isSubmitting || !approverComments.trim(),
                loading: isSubmitting,
              },
              {
                id: 'approve',
                label: 'Approve',
                onClick: handleApprove,
                variant: 'default',
                disabled: isSubmitting || !approverComments.trim(),
                loading: isSubmitting,
              },
            ]}
            customActionsPosition="split"
          />
        </div>
      </div>
    </PageLayout>
  );
}
