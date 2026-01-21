/**
 * Skills Set Form
 * Employee skills with certifications/documents
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SkillsSetForm, SkillItem } from '../../types/onboarding.types';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable/EditableItemsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Link as LinkIcon, FileText } from 'lucide-react';

interface SkillsSetFormProps {
  form: UseFormReturn<SkillsSetForm>;
}

export function SkillsSetFormComponent({ form }: SkillsSetFormProps) {
  const { watch, setValue } = form;
  
  const items = watch('items') || [];
  const [activeView, setActiveView] = useState<'view' | 'edit'>('view');

  const columns: TableColumn<SkillItem>[] = [
    {
      key: 'name',
      header: 'Skill Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., React, Java, Project Management',
      flex: 2,
    },
    {
      key: 'certificationType',
      header: 'Certification Type',
      type: 'select',
      required: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'URL Link', value: 'url' },
        { label: 'File Upload', value: 'file' },
      ],
      width: '150px',
    },
    {
      key: 'certificationUrl',
      header: 'Certification URL',
      type: 'text',
      placeholder: 'https://...',
      flex: 2,
    },
  ];

  const emptyItem: SkillItem = {
    id: '',
    name: '',
    certificationType: 'none',
    certificationUrl: '',
    certificationFile: null,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Add your professional skills and certifications
          </p>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList>
          <TabsTrigger value="view">View Mode</TabsTrigger>
          <TabsTrigger value="edit">Edit Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No skills added yet</p>
              <p className="text-sm mt-2">Switch to Edit Mode to add your skills</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveView('edit')}
              >
                Add Skills
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{skill.name}</h4>
                        <Award className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {skill.certificationType !== 'none' && (
                        <div className="flex items-center gap-2 text-sm">
                          {skill.certificationType === 'url' ? (
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
                      {skill.certificationType === 'none' && (
                        <Badge variant="outline">No Certification</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <EditableItemsTable
            columns={columns}
            items={items}
            onChange={(newItems) => setValue('items', newItems)}
            emptyItemTemplate={emptyItem}
            minItems={0}
            maxItems={20}
          />
          {items.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setActiveView('view')}>
                View Skills
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
