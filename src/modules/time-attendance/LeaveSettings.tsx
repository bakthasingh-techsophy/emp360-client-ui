/**
 * Leave Settings Page
 * Manage leave types and configurations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { LeaveType } from './types/leave.types';
import { mockLeaveTypes } from './data/mockLeaveData';
import { useToast } from '@/hooks/use-toast';

export function LeaveSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#3b82f6',
    icon: '',
  });

  const handleBack = () => {
    navigate('/leave-holiday');
  };

  const handleOpenDialog = (leaveType?: LeaveType) => {
    if (leaveType) {
      setEditingLeaveType(leaveType);
      setFormData({
        name: leaveType.name,
        code: leaveType.code,
        color: leaveType.color,
        icon: leaveType.icon || '',
      });
    } else {
      setEditingLeaveType(null);
      setFormData({
        name: '',
        code: '',
        color: '#3b82f6',
        icon: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLeaveType(null);
    setFormData({
      name: '',
      code: '',
      color: '#3b82f6',
      icon: '',
    });
  };

  const handleSaveLeaveType = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingLeaveType) {
      // Update existing leave type
      setLeaveTypes(leaveTypes.map(lt => 
        lt.id === editingLeaveType.id 
          ? { ...lt, ...formData }
          : lt
      ));
      toast({
        title: 'Leave Type Updated',
        description: `${formData.name} has been updated successfully`,
      });
    } else {
      // Create new leave type
      const newLeaveType: LeaveType = {
        id: `lt-${Date.now()}`,
        ...formData,
      };
      setLeaveTypes([...leaveTypes, newLeaveType]);
      toast({
        title: 'Leave Type Created',
        description: `${formData.name} has been created successfully`,
      });
    }

    handleCloseDialog();
  };

  const handleDeleteLeaveType = (id: string) => {
    const leaveType = leaveTypes.find(lt => lt.id === id);
    if (leaveType) {
      setLeaveTypes(leaveTypes.filter(lt => lt.id !== id));
      toast({
        title: 'Leave Type Deleted',
        description: `${leaveType.name} has been deleted`,
        variant: 'destructive',
      });
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
          <Button onClick={() => handleOpenDialog()}>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTypes.length > 0 ? (
                      leaveTypes.map((leaveType) => (
                        <TableRow key={leaveType.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${leaveType.color}20` }}
                              >
                                <CalendarDays 
                                  className="h-5 w-5" 
                                  style={{ color: leaveType.color }}
                                />
                              </div>
                              {leaveType.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-6 rounded border"
                                style={{ backgroundColor: leaveType.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {leaveType.color}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(leaveType)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLeaveType(leaveType.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No leave types found. Create your first leave type to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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

      {/* Create/Edit Leave Type Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}
            </DialogTitle>
            <DialogDescription>
              {editingLeaveType 
                ? 'Update the leave type details below' 
                : 'Add a new leave type to your organization'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Leave Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Annual Leave, Sick Leave"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Leave Code *</Label>
              <Input
                id="code"
                placeholder="e.g., AL, SL"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Optional)</Label>
              <Input
                id="icon"
                placeholder="e.g., calendar, sun, medical"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Icon name from Lucide icons library
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveLeaveType}>
              {editingLeaveType ? 'Update' : 'Create'} Leave Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
