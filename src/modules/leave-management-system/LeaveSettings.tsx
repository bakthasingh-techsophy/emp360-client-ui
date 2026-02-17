/**
 * Leave Settings Page
 * Manage leave types and configurations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, Users, FileX } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useLeaveManagement } from '@/contexts/LeaveManagementContext';
import { useCompany } from '@/contexts/CompanyContext';
import { LeaveConfiguration } from './types/leaveConfiguration.types';
import UniversalSearchRequest from '@/types/search';

export function LeaveSettings() {
  const navigate = useNavigate();
  const { 
    searchLeaveConfigurations,
    deleteLeaveConfigurationById,
    isLoading 
  } = useLeaveManagement();
  const { companies } = useCompany();

  const [leaveConfigurations, setLeaveConfigurations] = useState<LeaveConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string | React.ReactNode;
    action: () => void;
    variant?: 'default' | 'destructive';
    confirmText?: string;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  // Load leave configurations on mount
  useEffect(() => {
    loadLeaveConfigurations();
  }, []);

  const loadLeaveConfigurations = async () => {
    setLoading(true);
    const searchRequest: UniversalSearchRequest = {
      filters: {}
    };
    const result = await searchLeaveConfigurations(searchRequest, 0, 100);
    if (result) {
      setLeaveConfigurations(result.content);
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/leave-holiday');
  };

  const handleAddLeaveType = () => {
    navigate('/leave-configuration-form?mode=create');
  };

  const handleEditLeaveType = (config: LeaveConfiguration) => {
    navigate(`/leave-configuration-form?mode=edit&id=${config.id}`);
  };

  const handleDeleteLeaveType = (config: LeaveConfiguration) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Leave Type',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{config.name}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. The leave type will be permanently removed.
          </p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: async () => {
        const success = await deleteLeaveConfigurationById(config.id);
        if (success) {
          loadLeaveConfigurations();
        }
      },
    });
  };

  const getCompanyName = (companyId: string): string => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || companyId;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'flexible': 'Flexible',
      'accrued': 'Accrued',
      'special': 'Special',
      'monetization': 'Monetization',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'flexible': 'secondary',
      'accrued': 'default',
      'special': 'destructive',
      'monetization': 'outline',
    };
    return colors[category] || 'default';
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Leave Settings</h1>
              <p className="text-muted-foreground mt-1">
                Configure leave types and policies
              </p>
            </div>
          </div>
          <Button onClick={handleAddLeaveType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="leave-types" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
            <TabsTrigger value="holidays" disabled>Holidays</TabsTrigger>
          </TabsList>

          <TabsContent value="leave-types">
            <Card>
              <CardHeader>
                <CardTitle>Leave Types</CardTitle>
                <CardDescription>
                  Manage different types of leaves available in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading || isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading leave types...</p>
                    </div>
                  </div>
                ) : leaveConfigurations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <FileX className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Leave Types Found</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Get started by creating your first leave type. Add annual leave, sick leave, or any custom leave types your organization needs.
                    </p>
                    <Button onClick={handleAddLeaveType}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Leave Type
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveConfigurations.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{config.name}</div>
                              {config.tagline && (
                                <div className="text-xs text-muted-foreground">{config.tagline}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getCategoryColor(config.category) as any}>
                              {getCategoryLabel(config.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getCompanyName(config.companyId)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLeaveType(config)}
                                title="Edit leave configuration"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title={`${config.employeeIds?.length || 0} employees`}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                {config.employeeIds?.length || 0}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLeaveType(config)}
                                disabled={isLoading}
                                title="Delete leave type"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle>Holiday Configuration</CardTitle>
                <CardDescription>
                  Manage public holidays and restricted holidays (Coming soon)
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText || 'Confirm'}
          cancelText="Cancel"
          variant={confirmDialog.variant}
          onConfirm={() => {
            confirmDialog.action();
            setConfirmDialog({ ...confirmDialog, open: false });
          }}
        />
      </div>
    </PageLayout>
  );
}
