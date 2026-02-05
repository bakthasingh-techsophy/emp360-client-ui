/**
 * Skills Set Form
 * Employee skills with certifications/documents - Modal-based creation
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { SkillsSetForm, SkillItem, CertificationType } from '../../types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Link as LinkIcon, FileText, Edit2, Trash2, Plus } from 'lucide-react';

// Zod schema for SkillsSet validation
export const skillsSetSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    employeeId: z.string().optional(),
    name: z.string(),
    certificationType: z.nativeEnum(CertificationType),
    certificationUrl: z.string().optional(),
    certificationFile: z.any().optional(),
    certificationFileName: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })),
});

interface SkillsSetFormProps {
  form: UseFormReturn<SkillsSetForm>;
  employeeId?: string;
}

export function SkillsSetFormComponent({ employeeId }: SkillsSetFormProps) {
  const { refreshSkills, createSkill, updateSkill, deleteSkill } = useUserManagement();
  
  const [items, setItems] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillItem | null>(null);
  
  // Modal form state
  const [name, setName] = useState('');
  const [certificationType, setCertificationType] = useState<CertificationType>(CertificationType.NONE);
  const [certificationUrl, setCertificationUrl] = useState('');

  const fetchSkills = async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    try {
      const filters = [{ id: 'employeeId', filterId: 'employeeId', operator: 'eq', value: employeeId }];
      const data = await refreshSkills(filters, '', 0, 100);
      if (data && data.content) {
        setItems(data.content as any);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [employeeId]);

  const handleOpenModal = (item?: SkillItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setCertificationType(item.certificationType);
      setCertificationUrl(item.certificationUrl || '');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setName('');
    setCertificationType(CertificationType.NONE);
    setCertificationUrl('');
  };

  const handleSave = async () => {
    if (!employeeId) return;

    if (editingItem && editingItem.id) {
      // Update existing - use record (plain object)
      await updateSkill(editingItem.id, {
        name,
        certificationType,
        certificationUrl: certificationType === CertificationType.URL ? certificationUrl : undefined,
      });
    } else {
      // Create new - use carrier
      await createSkill({
        employeeId,
        name,
        certificationType: certificationType === CertificationType.NONE ? "NONE" : 
                          certificationType === CertificationType.URL ? "URL" : "FILE",
        certificationUrl: certificationType === CertificationType.URL ? certificationUrl : undefined,
        createdAt: new Date().toISOString(),
      });
    }

    await fetchSkills();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    await deleteSkill(id);
    await fetchSkills();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Add your professional skills and certifications
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Skill' : 'Add Skill'}
              </DialogTitle>
              <DialogDescription>
                Add details about your skill and certification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Skill Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., React, Java, Project Management"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificationType">
                  Certification Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={certificationType}
                  onValueChange={(value) => setCertificationType(value as CertificationType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CertificationType.NONE}>None</SelectItem>
                    <SelectItem value={CertificationType.URL}>URL Link</SelectItem>
                    <SelectItem value={CertificationType.FILE}>File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {certificationType === CertificationType.URL && (
                <div className="space-y-2">
                  <Label htmlFor="certificationUrl">Certification URL</Label>
                  <Input
                    id="certificationUrl"
                    value={certificationUrl}
                    onChange={(e) => setCertificationUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              {certificationType === CertificationType.FILE && (
                <div className="space-y-2">
                  <Label htmlFor="certificationFile">Upload Certificate</Label>
                  <Input id="certificationFile" type="file" />
                  <p className="text-xs text-muted-foreground">
                    Upload your certification document
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name || !certificationType}
              >
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No skills added yet</p>
          <p className="text-sm mt-2">Click "Add Skill" to add your skills and certifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-semibold">{skill.name}</h4>
                      </div>
                      {skill.certificationType !== CertificationType.NONE && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          {skill.certificationType === CertificationType.URL ? (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              <a
                                href={skill.certificationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Certificate Link
                              </a>
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4" />
                              <span className="text-muted-foreground">
                                {skill.certificationFileName || 'Certificate File'}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {skill.certificationType === CertificationType.NONE && (
                        <Badge variant="secondary" className="mt-2">No Certification</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenModal(skill)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => skill.id && handleDelete(skill.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
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
