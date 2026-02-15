/**
 * Assets Form
 * Track company assets allocated to the employee
 */

import { useState, useEffect } from 'react';
import { UseFormReturn, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { AssetsForm } from '../../types/onboarding.types';

// Zod schema for Assets validation
export const assetsSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    employeeId: z.string(),
    assetName: z.string().min(1, 'Asset name is required'),
    code: z.string().min(1, 'Code is required'),
    givenDate: z.string().min(1, 'Given date is required'),
    takeDate: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })),
});

// Single asset form schema
const assetFormSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  code: z.string().min(1, 'Code is required'),
  givenDate: z.string().min(1, 'Given date is required'),
  takeDate: z.string().optional().or(z.literal('')),
});

type AssetFormDataLocal = z.infer<typeof assetFormSchema>;

interface AssetsFormProps {
  form: UseFormReturn<AssetsForm>;
  employeeId?: string;
}

// Dummy data for visualization
const getDummyAssets = (employeeId?: string): AssetsForm => {
  return {
    items: [
      {
        id: 'AST-001',
        employeeId: employeeId || 'EMP-12345',
        assetName: 'MacBook Pro 16-inch',
        code: 'LPT-2024-001',
        givenDate: '2024-01-15',
        takeDate: '2026-01-15',
      },
      {
        id: 'AST-002',
        employeeId: employeeId || 'EMP-12345',
        assetName: 'iPhone 15 Pro',
        code: 'MOB-2024-001',
        givenDate: '2024-02-01',
        takeDate: '2025-02-01',
      },
      {
        id: 'AST-003',
        employeeId: employeeId || 'EMP-12345',
        assetName: 'Dell UltraSharp 27-inch',
        code: 'MON-2024-001',
        givenDate: '2024-01-15',
      },
      {
        id: 'AST-004',
        employeeId: employeeId || 'EMP-12345',
        assetName: 'Sony WH-1000XM5 Headset',
        code: 'HSD-2024-001',
        givenDate: '2024-03-10',
      },
    ],
  };
};

export function AssetsFormComponent({ form, employeeId }: AssetsFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Asset form for modal
  const assetForm = useForm<AssetFormDataLocal>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetName: '',
      code: '',
      givenDate: '',
      takeDate: '',
    },
  });

  useEffect(() => {
    // For now, load dummy data
    // TODO: Replace with actual API call when endpoint is ready
    const dummyData = getDummyAssets(employeeId);
    form.reset(dummyData);
    setIsLoading(false);
  }, [employeeId, form]);

  const handleOpenModal = () => {
    setEditingIndex(null);
    assetForm.reset({
      assetName: '',
      code: '',
      givenDate: '',
      takeDate: '',
    });
    setShowModal(true);
  };

  const handleEditAsset = (index: number) => {
    const asset = fields[index];
    assetForm.reset({
      assetName: asset.assetName,
      code: asset.code,
      givenDate: asset.givenDate,
      takeDate: asset.takeDate || '',
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    assetForm.reset();
    setEditingIndex(null);
  };

  const handleSubmitAsset = async (data: AssetFormDataLocal) => {
    if (editingIndex !== null) {
      // Update existing asset
      update(editingIndex, {
        ...fields[editingIndex],
        assetName: data.assetName,
        code: data.code,
        givenDate: data.givenDate,
        takeDate: data.takeDate || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add new asset
      const newAsset = {
        id: `AST-${Date.now()}`,
        employeeId: employeeId || '',
        assetName: data.assetName,
        code: data.code,
        givenDate: data.givenDate,
        takeDate: data.takeDate || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      append(newAsset);
    }
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Loading employee assets...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const assets = form.getValues('items') || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Assets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'} assigned
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={handleOpenModal}>
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        {/* Assets List */}
        {assets.length > 0 ? (
          <div className="grid gap-2">
            {fields.map((field, index) => {
              const asset = assets[index];
              return (
                <Card key={field.id} className="overflow-hidden hover:shadow-sm transition-shadow border">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3">
                      {/* Asset Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Asset Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{asset.assetName}</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-1">
                          <div>
                            <p className="text-xs">Code</p>
                            <p className="font-mono font-medium text-foreground">{asset.code}</p>
                          </div>
                          <div>
                            <p className="text-xs">Given</p>
                            <p className="font-medium text-foreground">
                              {new Date(asset.givenDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs">Take</p>
                            <p className="font-medium text-foreground">
                              {asset.takeDate ? new Date(asset.takeDate).toLocaleDateString('en-IN') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1 ml-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditAsset(index)}
                          title="Edit asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => remove(index)}
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">No assets allocated</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Asset" to start assigning assets</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Asset Modal - Add/Edit */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {editingIndex !== null ? 'Update asset details' : 'Fill in the details to allocate a new asset'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={assetForm.handleSubmit(handleSubmitAsset)} className="space-y-4">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                placeholder="e.g., MacBook Pro 16-inch"
                {...assetForm.register('assetName')}
              />
              {assetForm.formState.errors.assetName && (
                <p className="text-sm text-destructive">{assetForm.formState.errors.assetName.message}</p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., LPT-2024-001"
                {...assetForm.register('code')}
              />
              {assetForm.formState.errors.code && (
                <p className="text-sm text-destructive">{assetForm.formState.errors.code.message}</p>
              )}
            </div>

            {/* Given Date and Take Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenDate">Given Date *</Label>
                <Input
                  id="givenDate"
                  type="date"
                  {...assetForm.register('givenDate')}
                />
                {assetForm.formState.errors.givenDate && (
                  <p className="text-sm text-destructive">{assetForm.formState.errors.givenDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeDate">Take Date</Label>
                <Input
                  id="takeDate"
                  type="date"
                  {...assetForm.register('takeDate')}
                />
                {assetForm.formState.errors.takeDate && (
                  <p className="text-sm text-destructive">{assetForm.formState.errors.takeDate.message}</p>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingIndex !== null ? 'Update Asset' : 'Save Asset'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
