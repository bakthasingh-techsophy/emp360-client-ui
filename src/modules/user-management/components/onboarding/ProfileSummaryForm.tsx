/**
 * Profile Summary Form
 * Simple about/summary text for employee profile
 * Allows adding a personal summary/bio
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { ProfileSummaryForm } from '../../types/onboarding.types';

interface ProfileSummaryFormProps {
  form: UseFormReturn<ProfileSummaryForm>;
  employeeId?: string;
}

// Dummy data for visualization
const getDummyProfileSummary = (employeeId?: string): ProfileSummaryForm => {
  return {
    id: 'PS-001',
    employeeId: employeeId || 'EMP-12345',
    aboutText: 'Experienced Full Stack Developer with 5+ years of expertise in building scalable web applications. Passionate about clean code, architecture, and mentoring junior developers. Strong background in React, Node.js, and cloud technologies. Always eager to learn new technologies and take on challenging projects.',
  };
};

export function ProfileSummaryFormComponent({ form, employeeId }: ProfileSummaryFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    formState: { errors },
    reset,
    getValues,
  } = form;

  useEffect(() => {
    // For now, load dummy data
    // TODO: Replace with actual API call when endpoint is ready
    const dummyData = getDummyProfileSummary(employeeId);
    reset(dummyData);
    setIsLoading(false);
  }, [employeeId, reset]);

  if (isLoading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
            <CardDescription>Loading profile summary...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const aboutText = getValues('aboutText') || '';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleSave = () => {
    // TODO: Call API to save profile summary
    setIsEditing(false);
    console.log('Saved profile summary:', getValues());
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>About You</CardTitle>
              <CardDescription>Your professional summary and background</CardDescription>
            </div>
            {!isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutText" className="text-base font-semibold">
                  Professional Summary
                </Label>
                <Textarea
                  id="aboutText"
                  placeholder="Write about yourself, your experience, skills, and career goals..."
                  className="min-h-40 resize-none"
                  {...register('aboutText')}
                />
                {errors.aboutText && (
                  <p className="text-sm text-red-500">{errors.aboutText.message}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {aboutText ? (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                    {aboutText}
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-muted-foreground italic">
                    No summary added yet. Click "Edit" to add your professional summary.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
