/**
 * BulkImportDialog
 * Dialog for uploading a CSV or XLSX file to bulk-import users.
 * Accepts .csv and .xlsx files only (validated client-side and by the API).
 * Shows filename of selected file and a result summary after import.
 * Features animated upload progress indication.
 */

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { BulkImportResult } from "@/services/excelSheetService";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => Promise<BulkImportResult | null>;
  isSubmitting: boolean;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: BulkImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const ACCEPTED_TYPES = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const isValidFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return (
      ACCEPTED_TYPES.includes(file.type) || ext === "csv" || ext === "xlsx"
    );
  };

  const handleFileSelect = (file: File) => {
    setFileError(null);
    if (!isValidFile(file)) {
      setFileError("Only .csv and .xlsx files are supported.");
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setFileError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile || isSubmitting) return;
    const importResult = await onSubmit(selectedFile);
    if (importResult) {
      setResult(importResult);
      // Keep dialog open to show result; user closes manually
    }
  };

  const handleClose = (open: boolean) => {
    if (isSubmitting) return; // prevent close while uploading
    if (!open) {
      setSelectedFile(null);
      setResult(null);
      setFileError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        {isSubmitting && (
          // Import animation overlay
          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  {/* Outer rotating circle */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                  
                  {/* Middle pulsing circle */}
                  <div className="absolute inset-2 rounded-full border-2 border-green-500/30 animate-pulse"></div>
                  
                  {/* Inner rotating circle (slower, opposite direction) */}
                  <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-green-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-green-500 animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Importing users...</p>
                <p className="text-xs text-muted-foreground mt-1">Processing your file</p>
              </div>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Users
          </DialogTitle>
          <DialogDescription>
            Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with
            user data. All 20 required columns must be present. Download the
            template first if you haven't already.
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 py-2 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* File Drop Zone */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Click to browse or drag & drop
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: .csv, .xlsx
              </p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* File error */}
          {fileError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {fileError}
            </p>
          )}

          {/* Selected file display */}
          {selectedFile && !result && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {!isSubmitting && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Result summary */}
          {result && (
            <div className="space-y-3">
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  result.data.failureCount === 0
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-destructive/10 border-destructive/30"
                }`}
              >
                {result.data.failureCount === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {result.data.failureCount === 0
                      ? "Import Successful"
                      : "Import Completed with Errors"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      {result.data.successCount} imported
                    </span>
                    {result.data.failureCount > 0 && (
                      <>
                        {" · "}
                        <span className="text-destructive font-medium">
                          {result.data.failureCount} failed
                        </span>
                      </>
                    )}
                  </p>
                  {result.data.failureCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      An error sheet with failed rows has been downloaded. Fix the
                      errors and re-upload.
                    </p>
                  )}
                </div>
              </div>

              {/* Allow importing another file */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  setResult(null);
                  setSelectedFile(null);
                }}
              >
                <Upload className="h-4 w-4" />
                Import Another File
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!result && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-foreground rounded-full animate-spin"></div>
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
