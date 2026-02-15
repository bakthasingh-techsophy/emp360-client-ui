/**
 * Skills Set Display & Management Card for Self-Service Profile
 * View and manage employee skills and certifications with modal-based operations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Link as LinkIcon, FileText, Trash2, Edit2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelfService } from '@/contexts/SelfServiceContext';
import { SkillItem, CertificationType } from '@/modules/user-management/types/onboarding.types';
import UniversalSearchRequest from '@/types/search';

export function SkillsSetCard() {
  const { refreshSkillsSelfService, deleteSkillSelfService, createSkillSelfService, updateSkillSelfService } = useSelfService();
  const [items, setItems] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillItem | null>(null);

  // Form state
  const [skillName, setSkillName] = useState('');
  const [certificationType, setCertificationType] = useState<CertificationType>(CertificationType.NONE);
  const [certificationUrl, setCertificationUrl] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    const searchRequest: UniversalSearchRequest = {
      filters: {
        and: {},
      },
    };
    const result = await refreshSkillsSelfService(searchRequest, 0, 100);
    if (result && result.content) {
      setItems(result.content as any);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (item?: SkillItem) => {
    if (item) {
      setEditingItem(item);
      setSkillName(item.name);
      setCertificationType(item.certificationType);
      setCertificationUrl(item.certificationUrl || '');
    } else {
      setEditingItem(null);
      setSkillName('');
      setCertificationType(CertificationType.NONE);
      setCertificationUrl('');
    }
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSkillName('');
    setCertificationType(CertificationType.NONE);
    setCertificationUrl('');
    setFormErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!skillName.trim()) {
      errors.push('Skill name is required');
    }
    if (certificationType === CertificationType.URL && !certificationUrl.trim()) {
      errors.push('Certification URL is required');
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingItem?.id) {
        // Update existing skill
        await updateSkillSelfService(editingItem.id, {
          name: skillName,
          certificationType,
          certificationUrl: certificationType === CertificationType.URL ? certificationUrl : undefined,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new skill
        await createSkillSelfService({
          name: skillName,
          certificationType,
          certificationUrl: certificationType === CertificationType.URL ? certificationUrl : undefined,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseModal();
      await fetchData();
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    await deleteSkillSelfService(id);
    await fetchData();
  };

  const getCertificationTypeIcon = (type: CertificationType) => {
    switch (type) {
      case CertificationType.URL:
        return <LinkIcon className="w-3.5 h-3.5" />;
      case CertificationType.FILE:
        return <FileText className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getCertificationTypeLabel = (type: CertificationType): string => {
    switch (type) {
      case CertificationType.URL:
        return 'Certified (Link)';
      case CertificationType.FILE:
        return 'Certified (File)';
      default:
        return 'Skill';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-primary" />
            Skills & Certifications
          </CardTitle>
          <CardDescription className="mt-1">Professional skills and achievements</CardDescription>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update your skill details' : 'Add a new skill or certification'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <ul className="text-xs text-destructive space-y-1">
                    {formErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="skillName">
                  Skill Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="skillName"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., React, Project Management, Leadership"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificationType">
                  Certification Type <span className="text-destructive">*</span>
                </Label>
                <Select value={certificationType} onValueChange={(value) => setCertificationType(value as CertificationType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select certification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CertificationType.NONE}>No Certification</SelectItem>
                    <SelectItem value={CertificationType.URL}>URL Link</SelectItem>
                    <SelectItem value={CertificationType.FILE}>File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {certificationType === CertificationType.URL && (
                <div className="space-y-2">
                  <Label htmlFor="certificationUrl">
                    Certification URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="certificationUrl"
                    value={certificationUrl}
                    onChange={(e) => setCertificationUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-9"
                    type="url"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                {editingItem ? 'Update' : 'Add'} Skill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {!items || items.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground">No skills added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first skill to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((skill) => (
              <div
                key={skill.id}
                className="group relative p-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-border transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{skill.name}</h4>
                  </div>
                  {skill.certificationType !== CertificationType.NONE && 
                    getCertificationTypeIcon(skill.certificationType) && (
                    <Badge
                      variant="outline"
                      className="whitespace-nowrap text-xs flex items-center gap-1 ml-2"
                    >
                      {getCertificationTypeIcon(skill.certificationType)}
                      {getCertificationTypeLabel(skill.certificationType)}
                    </Badge>
                  )}
                </div>

                {skill.certificationUrl && (
                  <a
                    href={skill.certificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mb-3"
                  >
                    <LinkIcon className="w-3 h-3" />
                    View Certificate
                  </a>
                )}

                {/* Actions - Hidden on mobile, visible on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenModal(skill)}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(skill.id || '')}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
