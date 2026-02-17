/**
 * Leave Type Management Page
 * Manage a specific leave type - assign to companies, configure policies, etc.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, Settings2, FileX } from 'lucide-react';
import { useLeaveManagement } from '@/contexts/LeaveManagementContext';
import { LeaveConfigurationBasicDetails } from '@/services/leaveConfigurationBasicDetailsService';
import { LeaveConfiguration } from './types/leaveConfiguration.types';

export function LeaveTypeManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leaveTypeId = searchParams.get('id');

  const {
    getLeaveConfigurationBasicDetailsById,
    searchLeaveConfigurations,
    isLoading,
  } = useLeaveManagement();

  const [leaveType, setLeaveType] = useState<LeaveConfigurationBasicDetails | null>(null);
  const [configurations, setConfigurations] = useState<LeaveConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leave type details
  useEffect(() => {
    if (leaveTypeId) {
      loadLeaveTypeDetails();
      loadConfigurations();
    }
  }, [leaveTypeId]);

  const loadLeaveTypeDetails = async () => {
    if (!leaveTypeId) return;
    
    const details = await getLeaveConfigurationBasicDetailsById(leaveTypeId);
    if (details) {
      setLeaveType(details);
    }
  };

  const loadConfigurations = async () => {
    if (!leaveTypeId) return;
    
    setLoading(true);
    // Search configurations linked to this leave type
    // Note: This is a simplified search. In production, you'd filter by leaveConfigurationBasicDetailsId
    const result = await searchLeaveConfigurations(
      {
        filters: {},
      },
      0,
      100
    );
    
    if (result) {
      setConfigurations(result.content);
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/leave-settings');
  };

  const handleAddConfiguration = () => {
    navigate(`/leave-configuration-form?mode=create&leaveTypeId=${leaveTypeId}`);
  };

  const handleEditConfiguration = (configId: string) => {
    navigate(`/leave-configuration-form?mode=edit&id=${configId}&leaveTypeId=${leaveTypeId}`);
  };

  const handleDeleteConfiguration = (configId: string) => {
    // TODO: Implement delete with confirmation dialog
    console.log('Delete configuration:', configId);
  };

  if (!leaveTypeId) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Invalid Leave Type</h2>
            <p className="text-muted-foreground mb-4">No leave type ID provided</p>
            <Button onClick={handleBack}>Back to Settings</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

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
              <h1 className="text-3xl font-bold">
                {leaveType ? leaveType.name : 'Leave Type Management'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {leaveType?.tagline || 'Manage configurations and company assignments'}
              </p>
              {leaveType?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {leaveType.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              Code: {leaveType?.code || 'Loading...'}
            </Badge>
          </div>
        </div>

        {/* Configurations Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Leave Configurations</CardTitle>
              <CardDescription>
                Manage policies, restrictions, and applicability rules for this leave type
              </CardDescription>
            </div>
            <Button onClick={handleAddConfiguration}>
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </CardHeader>
          <CardContent>
            {loading || isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading configurations...</p>
                </div>
              </div>
            ) : configurations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Configurations Found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  This leave type doesn't have any configurations yet. Add your first configuration to define policies, restrictions, and applicability rules.
                </p>
                <Button onClick={handleAddConfiguration}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Configuration
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Marital Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `#3b82f620` }}
                          >
                            <Settings2 
                              className="h-5 w-5" 
                              style={{ color: '#3b82f6' }}
                            />
                          </div>
                          <div>
                            <div className="font-medium capitalize">{config.category}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {config.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Company ID: {config.applicableCategories?.companyId || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {config.applicableCategories?.gender || 'All'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {config.applicableCategories?.marriedStatus || 'All'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConfiguration(config.id!)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConfiguration(config.id!)}
                            disabled={isLoading}
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
      </div>
    </PageLayout>
  );
}
