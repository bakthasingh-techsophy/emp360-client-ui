/**
 * Expense Approval Page
 * Dedicated page for approvers to review and take action on expense/advance requests
 * Allows viewing details, editing amounts, adding comments, and approving/rejecting
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { FormHeader } from '@/components/common/FormHeader';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { mockExpenses } from './data/mockData';
import { ExpenseLineItem } from './types/expense.types';
import { EXPENSE_TYPE_LABELS, EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS } from './constants/expense.constants';
import { format } from 'date-fns';
import { User, Mail, Phone, Building2, DollarSign, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExpenseApprovalPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the expense
  const expense = mockExpenses.find(e => e.id === id);
  
  // State for editable data
  const [lineItems, setLineItems] = useState<ExpenseLineItem[]>(expense?.lineItems || []);
  const [approverComments, setApproverComments] = useState('');

  useEffect(() => {
    if (!expense) {
      toast({
        title: 'Error',
        description: 'Expense not found',
        variant: 'destructive',
      });
      navigate('/expense-management');
    }
  }, [expense, navigate, toast]);

  if (!expense) return null;

  // Calculate total from line items
  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  // Handle document uploads
  const handleDocumentsChange = (itemIndex: number, files: File[]) => {
    const updatedItems = [...lineItems];
    // Convert File objects to ExpenseAttachment format
    const newAttachments = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      attachments: newAttachments,
    };
    setLineItems(updatedItems);
  };

  const getDocuments = (_itemIndex: number): File[] => {
    // Return empty array as we're storing as ExpenseAttachment objects
    return [];
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

    setIsSubmitting(true);
    console.log('Approving expense:', {
      id: expense.id,
      adjustedLineItems: lineItems,
      adjustedTotal: calculateTotal(),
      approverComments,
      action: 'approved',
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Approved',
        description: 'Expense has been approved successfully',
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
    console.log('Rejecting expense:', {
      id: expense.id,
      approverComments,
      action: 'rejected',
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Rejected',
        description: 'Expense has been rejected',
      });
      setIsSubmitting(false);
      navigate('/expense-management');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/expense-management');
  };

  // Table columns configuration
  const columns: TableColumn<ExpenseLineItem>[] = [
    {
      key: 'category',
      header: 'Category',
      type: 'select',
      width: '180px',
      required: true,
      options: [
        { label: 'Travel', value: 'travel' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Meals', value: 'meals' },
        { label: 'Transport', value: 'transport' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Training', value: 'training' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Software', value: 'software' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      flex: 1,
      minWidth: '200px',
      required: true,
      placeholder: 'Item description',
    },
    {
      key: 'fromDate',
      header: 'From Date',
      type: 'date',
      width: '150px',
      required: true,
    },
    {
      key: 'toDate',
      header: 'To Date',
      type: 'date',
      width: '150px',
      required: true,
    },
    {
      key: 'amount',
      header: 'Amount ($)',
      type: 'number',
      width: '140px',
      required: true,
      min: 0,
      step: 0.01,
      align: 'right',
    },
    {
      key: 'attachments',
      header: 'Documents',
      type: 'documents',
      width: '120px',
    },
  ];

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

  const originalTotal = expense.amount;
  const adjustedTotal = calculateTotal();
  const hasAdjustments = originalTotal !== adjustedTotal;

  return (
    <PageLayout>
      <div className="flex justify-center px-2 sm:px-4 lg:px-6">
        <div className="w-full max-w-[min(100%,1400px)] space-y-6 pb-32">
          {/* Fixed Header */}
          <FormHeader
            title="Review & Take Action"
            description="Review the expense details, adjust amounts if needed, and approve or reject with your comments"
            onBack={handleCancel}
          />

          {/* Expense Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {expense.expenseNumber}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {EXPENSE_TYPE_LABELS[expense.type]}
                    </Badge>
                    <Badge className={EXPENSE_STATUS_COLORS[expense.status]}>
                      {EXPENSE_STATUS_LABELS[expense.status]}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                  <div className="text-sm font-medium">
                    {format(new Date(expense.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{expense.description}</p>
              </div>

              {/* Employee Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField 
                    icon={User} 
                    label="Employee Name" 
                    value={expense.employeeName} 
                  />
                  <InfoField 
                    icon={Building2} 
                    label="Employee ID" 
                    value={expense.employeeId} 
                  />
                  <InfoField 
                    icon={Building2} 
                    label="Department" 
                    value={expense.department} 
                  />
                  <InfoField 
                    icon={Mail} 
                    label="Email" 
                    value={expense.employeeEmail} 
                  />
                  <InfoField 
                    icon={Phone} 
                    label="Phone" 
                    value={expense.employeePhone} 
                  />
                  <InfoField 
                    icon={Calendar} 
                    label="Submitted Date" 
                    value={format(new Date(expense.createdAt), 'MMM dd, yyyy')} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Expense Items
                <span className="text-sm font-normal text-muted-foreground">
                  (You can adjust amounts if needed)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditableItemsTable
                columns={columns}
                items={lineItems}
                onChange={setLineItems}
                emptyItemTemplate={{
                  id: `temp-${Date.now()}`,
                  category: 'travel',
                  description: '',
                  fromDate: format(new Date(), 'yyyy-MM-dd'),
                  toDate: format(new Date(), 'yyyy-MM-dd'),
                  amount: 0,
                  attachments: [],
                }}
                minItems={1}
                allowAdd={false}
                allowRemove={false}
                showAddButton={false}
                onDocumentsChange={handleDocumentsChange}
                getDocuments={getDocuments}
              />

              {/* Total Amount Summary */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Original Total</span>
                  <span className="text-lg font-semibold">
                    ${originalTotal.toLocaleString()}
                  </span>
                </div>
                
                {hasAdjustments && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      Adjusted Total
                    </span>
                    <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                      ${adjustedTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                {!hasAdjustments && adjustedTotal > 0 && (
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <span className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${adjustedTotal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments & Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments & Decision *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Explain your decision to approve or reject this request
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your comments and reasoning here... (Required for both approval and rejection)"
                value={approverComments}
                onChange={(e) => setApproverComments(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Form Action Bar with Custom Actions */}
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
