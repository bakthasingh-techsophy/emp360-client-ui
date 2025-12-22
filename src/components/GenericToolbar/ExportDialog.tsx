import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Download, Mail } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: 'all' | 'results' | 'selection';
  onExport: (sendEmail: boolean, email?: string) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  exportType,
  onExport,
}) => {
  const [exportMethod, setExportMethod] = useState<'download' | 'email'>('download');
  const [email, setEmail] = useState('');

  const handleExport = () => {
    if (exportMethod === 'email' && !email) {
      return; // Don't proceed if email method is selected but no email provided
    }
    onExport(exportMethod === 'email', exportMethod === 'email' ? email : undefined);
    onOpenChange(false);
    // Reset state
    setExportMethod('download');
    setEmail('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setExportMethod('download');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Export {exportType === 'all' ? 'All Data' : exportType === 'results' ? 'Filtered Results' : 'Selected Items'}
          </DialogTitle>
          <DialogDescription>
            Choose how you want to export the data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={exportMethod} onValueChange={(value) => setExportMethod(value as 'download' | 'email')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="download" id="download" />
              <Label htmlFor="download" className="flex items-center gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                Just export (download file)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                Export and send as email
              </Label>
            </div>
          </RadioGroup>

          {exportMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email-input">Email Address</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportMethod === 'email' && !email}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
