/**
 * Document Upload Modal Component
 * Modal for uploading and managing documents for line items
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Image as ImageIcon, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: File[];
  onSave: (documents: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  documents: initialDocuments,
  onSave,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedFormats = ['image/*', 'application/pdf'],
}: DocumentUploadModalProps) {
  const [documents, setDocuments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDocuments([...initialDocuments]);
      setError(null);
    }
  }, [open, initialDocuments]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File ${file.name} exceeds maximum size of ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedFormats.some((format) => {
      if (format.endsWith('/*')) {
        const type = format.split('/')[0];
        return file.type.startsWith(type);
      }
      if (format.startsWith('.')) {
        return file.name.toLowerCase().endsWith(format);
      }
      return file.type === format;
    });

    if (!isValidType) {
      return `File ${file.name} has invalid format`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Check max files limit
    if (documents.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setDocuments([...documents, ...newFiles]);
    setError(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSave = () => {
    onSave(documents);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8" />;
    }
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload receipts, invoices, or supporting documents. Max {maxFiles} files, {maxFileSize}MB each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
              'hover:border-primary/50 cursor-pointer'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, Images, Word, Excel
              </p>
            </div>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Documents List */}
          {documents.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Uploaded Files ({documents.length}/{maxFiles})
              </Label>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="space-y-2">
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-md group hover:bg-muted transition-colors"
                    >
                      <div className="text-muted-foreground">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
