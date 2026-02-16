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
import { ArrowLeft, Plus, Edit2, Trash2, CalendarDays, FileX } from 'lucide-react';
import { LeaveConfiguration } from './types/leaveConfiguration.types';
import { useLeaveManagement } from '@/contexts/LeaveManagementContext';

export function LeaveSettings() {
  const navigate = useNavigate();
  const { 
    searchLeaveConfigurations, 
    deleteLeaveConfigurationById,
    isLoading 
  } = useLeaveManagement();

  const [leaveConfigurations, setLeaveConfigurations] = useState<LeaveConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leave configurations on mount
  useEffect(() => {
    loadLeaveConfigurations();
  }, []);

  const loadLeaveConfigurations = async () => {
    setLoading(true);
    const result = await searchLeaveConfigurations(
      { filters: {} },
      0,
      100
    );
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

  const handleDeleteLeaveType = async (id: string) => {
    const config = leaveConfigurations.find(lc => lc.id === id);
    if (config) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${config.name}"? This action cannot be undone.`
      );
      if (confirmed) {
        const success = await deleteLeaveConfigurationById(id);
        if (success) {
          // Refresh the list after deletion
          loadLeaveConfigurations();
        }
      }
    }
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
                        <TableHead>Credit Policy</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveConfigurations.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `#3b82f620` }}
                              >
                                <CalendarDays 
                                  className="h-5 w-5" 
                                  style={{ color: '#3b82f6' }}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{config.name}</div>
                                {config.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                                    {config.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">
                              {config.category.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {config.creditPolicy && (
                                <>
                                  <div>{config.creditPolicy.value} days</div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {config.creditPolicy.frequency.replace(/_/g, ' ').toLowerCase()}
                                  </div>
                                </>
                              )}
                              {!config.creditPolicy && <span className="text-muted-foreground">N/A</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLeaveType(config)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLeaveType(config.id!)}
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
      </div>
    </PageLayout>
  );
}
