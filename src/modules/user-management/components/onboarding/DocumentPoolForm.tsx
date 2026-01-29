/**
 * Document Pool Form
 * Document management with grid layout and upload modal
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentPool, DocumentItem } from '../../types/onboarding.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Link as LinkIcon, Trash2, Upload, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DocumentPoolFormProps {
  form: UseFormReturn<DocumentPool>;
}

export function DocumentPoolFormComponent({ form }: DocumentPoolFormProps) {
  const { watch, setValue } = form;
  
  const documents = watch('documents') || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'url' | 'file'>('url');
  const [docUrl, setDocUrl] = useState('');

  const handleAddDocument = () => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: docName,
      type: docType,
      url: docType === 'url' ? docUrl : undefined,
      fileName: docType === 'file' ? docName : undefined,
      uploadedDate: new Date().toISOString(),
      fileSize: '0 KB',
    };

    setValue('documents', [...documents, newDoc]);
    handleCloseModal();
  };

  const handleEditDocument = () => {
    if (!editingDoc) return;

    const updatedDocs = documents.map((doc) =>
      doc.id === editingDoc.id
        ? {
            ...doc,
            name: docName,
            type: docType,
            url: docType === 'url' ? docUrl : doc.url,
          }
        : doc
    );

    setValue('documents', updatedDocs);
    handleCloseModal();
  };

  const handleDeleteDocument = (id: string) => {
    setValue(
      'documents',
      documents.filter((doc) => doc.id !== id)
    );
  };

  const handleOpenModal = (doc?: DocumentItem) => {
    if (doc) {
      setEditingDoc(doc);
      setDocName(doc.name);
      setDocType(doc.type);
      setDocUrl(doc.url || '');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoc(null);
    setDocName('');
    setDocType('url');
    setDocUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Upload or link important documents
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? 'Edit Document' : 'Add Document'}
              </DialogTitle>
              <DialogDescription>
                Add a document by providing a URL or uploading a file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docName">Document Name</Label>
                <Input
                  id="docName"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g., Resume, Certificate"
                />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <RadioGroup value={docType} onValueChange={(value: any) => setDocType(value)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="doc-type-url" />
                      <Label htmlFor="doc-type-url" className="font-normal cursor-pointer">
                        URL Link
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="file" id="doc-type-file" />
                      <Label htmlFor="doc-type-file" className="font-normal cursor-pointer">
                        File Upload
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              {docType === 'url' && (
                <div className="space-y-2">
                  <Label htmlFor="docUrl">Document URL</Label>
                  <Input
                    id="docUrl"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              {docType === 'file' && (
                <div className="space-y-2">
                  <Label htmlFor="docFile">Upload File</Label>
                  <Input id="docFile" type="file" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                onClick={editingDoc ? handleEditDocument : handleAddDocument}
                disabled={!docName || (docType === 'url' && !docUrl)}
              >
                {editingDoc ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No documents uploaded yet</p>
          <p className="text-sm mt-2">Click the Upload Document button to add documents</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {doc.type === 'url' ? (
                        <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                    {doc.fileSize && doc.type === 'file' && (
                      <span className="text-xs text-muted-foreground">
                        {doc.fileSize}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {doc.type === 'url' && doc.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    )}
                    {doc.type === 'file' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(doc)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
