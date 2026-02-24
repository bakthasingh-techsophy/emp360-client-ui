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
import { Download, Mail, Zap } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: 'all' | 'results' | 'selection';
  onExport: (sendEmail: boolean, email?: string) => void;
  isExporting?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  exportType,
  onExport,
  isExporting = false,
}) => {
  const [exportMethod, setExportMethod] = useState<'download' | 'email'>('download');
  const [email, setEmail] = useState('');

  const handleExport = () => {
    if (exportMethod === 'email' && !email) {
      return; // Don't proceed if email method is selected but no email provided
    }
    onExport(exportMethod === 'email', exportMethod === 'email' ? email : undefined);
    // Don't reset immediately - let parent handle the dialog close
  };

  const handleCancel = () => {
    if (isExporting) return; // Prevent cancel while exporting
    onOpenChange(false);
    // Reset state
    setExportMethod('download');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {isExporting && (
          // Export animation overlay
          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  {/* Outer rotating circle */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
                  
                  {/* Middle pulsing circle */}
                  <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse"></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Exporting data...</p>
                <p className="text-xs text-muted-foreground mt-1">Processing your request</p>
              </div>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>
            Export {exportType === 'all' ? 'All Data' : exportType === 'results' ? 'Filtered Results' : 'Selected Items'}
          </DialogTitle>
          <DialogDescription>
            Choose how you want to export the data.
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 py-4 ${isExporting ? 'opacity-50 pointer-events-none' : ''}`}>
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
          <Button variant="outline" onClick={handleCancel} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportMethod === 'email' && !email || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-foreground rounded-full animate-spin"></div>
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
