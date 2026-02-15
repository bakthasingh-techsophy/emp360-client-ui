/**
 * Assets Tab
 * Manage available assets and their codes
 */

import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { type AssetType, type AssetCode } from '../../types/settings.types';

interface AssetItem {
  id: string;
  assetName: string;
  description?: string;
}

// Codes Table Component
interface CodesTableProps {
  codes: AssetCode[];
  onCodesChange: (codes: AssetCode[]) => void;
}

function CodesTable({ codes, onCodesChange }: CodesTableProps) {
  const codeColumns: TableColumn<AssetCode>[] = [
    {
      key: 'code',
      header: 'Code',
      type: 'text',
      placeholder: 'e.g., LPT-2024-001',
      minWidth: '150px',
      flex: 1,
    },
    {
      key: 'status',
      header: 'Status',
      type: 'select',
      minWidth: '120px',
      flex: 1,
      options: [
        { value: 'available', label: 'Available' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'retired', label: 'Retired' },
      ],
    },
  ];

  const emptyCode: AssetCode = {
    id: Date.now().toString(),
    code: '',
    status: 'available',
  };

  const handleCodesChange = (newCodes: AssetCode[]) => {
    onCodesChange(newCodes);
  };

  const handleSaveCode = async (_item: AssetCode, _index: number) => {
    // Code is automatically updated via onChange, this is just for save callback
    // You can add API calls here if needed in the future
  };

  const handleDeleteCode = (_item: AssetCode, index: number) => {
    const updatedCodes = codes.filter((_, i) => i !== index);
    onCodesChange(updatedCodes);
  };

  return (
    <EditableItemsTable<AssetCode>
      columns={codeColumns}
      items={codes}
      onChange={handleCodesChange}
      emptyItemTemplate={emptyCode}
      onSave={handleSaveCode}
      onDelete={handleDeleteCode}
      showAddButton={true}
      allowRemove={true}
    />
  );
}

export function AssetsTab() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  const [codes, setCodes] = useState<AssetCode[]>([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAssetIndex, setEditingAssetIndex] = useState<number | null>(null);
  const [assetFormData, setAssetFormData] = useState({ assetName: '', description: '' });

  // Load initial data
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    setIsLoading(true);
    // TODO: Replace with actual API call when endpoint is ready
    const defaultAssets: AssetType[] = [
      {
        id: 'ASSET_001',
        assetName: 'Laptop',
        description: 'Company laptops',
        codes: [
          { id: 'CODE_001', code: 'LPT-2024-001', status: 'available' },
          { id: 'CODE_002', code: 'LPT-2024-002', status: 'available' },
          { id: 'CODE_003', code: 'LPT-2024-003', status: 'assigned' },
        ],
      },
      {
        id: 'ASSET_002',
        assetName: 'Mouse',
        description: 'Wireless mouse',
        codes: [
          { id: 'CODE_004', code: 'MOU-2024-001', status: 'available' },
          { id: 'CODE_005', code: 'MOU-2024-002', status: 'available' },
        ],
      },
      {
        id: 'ASSET_003',
        assetName: 'Keyboard',
        description: 'Mechanical keyboard',
        codes: [
          { id: 'CODE_006', code: 'KBD-2024-001', status: 'available' },
        ],
      },
    ];

    setAssets(defaultAssets.map(a => ({ id: a.id, assetName: a.assetName, description: a.description })));
    setIsLoading(false);
  };

  const handleSelectAsset = (asset: AssetItem, index: number, fullAsset: AssetType) => {
    setSelectedAsset(asset);
    setSelectedAssetIndex(index);
    setCodes(fullAsset.codes || []);
  };

  const handleOpenAssetModal = () => {
    setEditingAssetIndex(null);
    setAssetFormData({ assetName: '', description: '' });
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: AssetItem, index: number) => {
    setEditingAssetIndex(index);
    setAssetFormData({ assetName: asset.assetName, description: asset.description || '' });
    setShowAssetModal(true);
  };

  const handleSaveAsset = () => {
    if (!assetFormData.assetName.trim()) return;

    const updatedAssets = [...assets];
    if (editingAssetIndex !== null) {
      updatedAssets[editingAssetIndex] = {
        ...updatedAssets[editingAssetIndex],
        assetName: assetFormData.assetName,
        description: assetFormData.description || undefined,
      };
    } else {
      updatedAssets.push({
        id: `ASSET_${Date.now()}`,
        assetName: assetFormData.assetName,
        description: assetFormData.description || undefined,
      });
    }
    setAssets(updatedAssets);
    setShowAssetModal(false);
    setAssetFormData({ assetName: '', description: '' });
  };

  const handleDeleteAsset = (index: number) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    setAssets(updatedAssets);
    if (selectedAssetIndex === index) {
      setSelectedAsset(null);
      setSelectedAssetIndex(null);
      setCodes([]);
    }
  };

  // Get the full asset with codes for display
  const getFullAsset = (asset: AssetItem): AssetType => ({
    ...asset,
    codes: selectedAssetIndex !== null && selectedAsset?.id === asset.id ? codes : [],
  });

  return (
    <div className="space-y-4">
      {/* Mobile Dropdown - Only visible on small screens */}
      <div className="lg:hidden">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Select Asset</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 items-end pt-0">
            <div className="flex-1 min-w-0">
              <Select
                value={selectedAsset?.id || ''}
                onValueChange={(value) => {
                  const index = assets.findIndex(a => a.id === value);
                  if (index !== -1) {
                    handleSelectAsset(assets[index], index, getFullAsset(assets[index]));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.assetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Action Buttons - in same line */}
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-3"
              onClick={handleOpenAssetModal}
              title="Add asset"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {selectedAsset && selectedAssetIndex !== null && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-3"
                  onClick={() => handleEditAsset(selectedAsset, selectedAssetIndex)}
                  title="Edit asset"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-3 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteAsset(selectedAssetIndex)}
                  title="Delete asset"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Assets List - Hidden on small screens */}
        <Card className="hidden lg:block lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assets</CardTitle>
                <CardDescription>Manage asset types</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={handleOpenAssetModal}
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 pt-2">
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : assets.length > 0 ? (
              <div className="space-y-1">
                {assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset, index, getFullAsset(asset))}
                    className={`p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAsset?.id === asset.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{asset.assetName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedAssetIndex === index ? codes.length : 0} codes
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAsset(asset, index);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsset(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No assets yet</p>
            )}
          </CardContent>
        </Card>

        {/* Codes Management - Full width on small screens, spans 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div>
              <CardTitle>
                {selectedAsset ? selectedAsset.assetName : 'Select an asset'} Codes
              </CardTitle>
              <CardDescription>
                {selectedAsset ? `Manage codes for ${selectedAsset.assetName}` : 'Select an asset to manage codes'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {selectedAsset ? (
              <CodesTable codes={codes} onCodesChange={setCodes} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Select an asset to manage its codes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asset Modal */}
      <Dialog open={showAssetModal} onOpenChange={setShowAssetModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingAssetIndex !== null ? 'Edit Asset' : 'Add New Asset'}
            </DialogTitle>
            <DialogDescription>
              {editingAssetIndex !== null
                ? 'Update asset details'
                : 'Create a new asset type for your company'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                placeholder="e.g., Laptop, Mouse, Keyboard"
                value={assetFormData.assetName}
                onChange={(e) => setAssetFormData({ ...assetFormData, assetName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={assetFormData.description}
                onChange={(e) => setAssetFormData({ ...assetFormData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAssetModal(false);
                setEditingAssetIndex(null);
                setAssetFormData({ assetName: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveAsset}>
              {editingAssetIndex !== null ? 'Update Asset' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
