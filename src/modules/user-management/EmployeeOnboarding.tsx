/**
 * Employee Onboarding/Edit Page
 * Dual-purpose page for creating new employees and editing existing ones
 * Create Mode: Only User Details required, submit creates user and unlocks other tabs
 * Edit Mode: All tabs unlocked, fetch data based on employee ID from URL params
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { FormActionBar } from '@/components/common/FormActionBar';
import { PageLayout } from '@/components/PageLayout';
import {
  UserDetails,
  JobDetails,
  GeneralDetails,
  BankingDetails,
  EmploymentHistory,
  SkillsSetForm,
  DocumentPool,
  PromotionHistoryForm,
  OnboardingTab,
  UserDetailsCarrier,
  UserStatus,
} from './types/onboarding.types';
import { UserDetailsFormComponent } from './components/onboarding/UserDetailsForm';
import { JobDetailsFormComponent } from './components/onboarding/JobDetailsForm';
import { GeneralDetailsFormComponent } from './components/onboarding/GeneralDetailsForm';
import { BankingDetailsFormComponent } from './components/onboarding/BankingDetailsForm';
import { EmploymentHistoryFormComponent } from './components/onboarding/EmploymentHistoryForm';
import { SkillsSetFormComponent } from './components/onboarding/SkillsSetForm';
import { DocumentPoolFormComponent } from './components/onboarding/DocumentPoolForm';
import { PromotionHistoryFormComponent } from './components/onboarding/PromotionHistoryForm';
import { OnboardingTabsNavigation } from './components/onboarding/OnboardingTabsNavigation';
import { mockUsers } from './data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/UserManagementContext';

export function EmployeeOnboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { onboardUser, isLoading } = useUserManagement();
  
  // Determine mode and employee ID from URL params
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'create';
  const employeeId = searchParams.get('id');
  
  // Track state
  const [activeTab, setActiveTab] = useState('user-details');
  const [isUserCreated, setIsUserCreated] = useState(mode === 'edit'); // Edit mode = user already exists
  const [userId, setUserId] = useState<string | null>(employeeId);
  const [isInitialLoading] = useState(mode === 'edit');

  // Form instances for each tab
  const userDetailsForm = useForm<UserDetails>({
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: UserStatus.ACTIVE,
    },
  });

  const jobDetailsForm = useForm<JobDetails>({
    defaultValues: {
      employeeId: '',
      officialEmail: '',
      primaryPhone: '',
      secondaryPhone: '',
      designation: '',
      employeeType: 'full-time',
      workLocation: '',
      reportingManager: '',
      joiningDate: '',
      dateOfBirth: '',
      celebrationDOB: '',
      sameAsDOB: false,
      shift: '',
      probationPeriod: 3,
    },
  });

  const generalDetailsForm = useForm<GeneralDetails>({
    defaultValues: {
      firstName: '',
      lastName: '',
      employeeId: '',
      officialEmail: '',
      phone: '',
      secondaryPhone: '',
      gender: 'male',
      bloodGroup: '',
      panNumber: '',
      aadharNumber: '',
      contactAddress: '',
      permanentAddress: '',
      sameAsContactAddress: false,
      emergencyContacts: [],
      personalEmail: '',
      nationality: '',
      physicallyChallenged: false,
      passportNumber: '',
      passportExpiry: '',
      maritalStatus: 'single',
    },
  });

  const bankingDetailsForm = useForm<BankingDetails>({
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
    },
  });

  const employmentHistoryForm = useForm<EmploymentHistory>({
    defaultValues: {
      items: [],
      viewMode: 'timeline',
    },
  });

  const skillsSetForm = useForm<SkillsSetForm>({
    defaultValues: {
      items: [],
      viewMode: 'view',
    },
  });

  const documentPoolForm = useForm<DocumentPool>({
    defaultValues: {
      documents: [],
    },
  });

  const promotionHistoryForm = useForm<PromotionHistoryForm>({
    defaultValues: {
      items: [],
    },
  });

  // Load user data in edit mode
  useEffect(() => {
    if (mode === 'edit' && employeeId) {
      // Simulate API call - fetch from mock data
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === employeeId || u.employeeId === employeeId);
        
        if (user) {
          // Populate User Details form
          userDetailsForm.reset({
            employeeId: user.employeeId,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            email: user.email,
            phone: user.phone,
            status: user.status,
          });

          // Populate General Details form (if data exists)
          generalDetailsForm.reset({
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            employeeId: user.employeeId,
            officialEmail: user.email,
            phone: user.phone,
            secondaryPhone: '',
            gender: 'male',
            bloodGroup: '',
            panNumber: '',
            aadharNumber: '',
            contactAddress: '',
            permanentAddress: '',
            sameAsContactAddress: false,
            emergencyContacts: [],
            personalEmail: '',
            nationality: '',
            physicallyChallenged: false,
            passportNumber: '',
            passportExpiry: '',
            maritalStatus: 'single',
          });

          setUserId(user.id);
          setIsUserCreated(true);
          
          toast({
            title: 'Employee data loaded',
            description: `Editing ${user.name}`,
          });
        } else {
          toast({
            title: 'Employee not found',
            description: 'Redirecting to create mode...',
            variant: 'destructive',
          });
          setSearchParams({});
        }
      }, 500);
    }
  }, [mode, employeeId]);

  // Tab configuration - lock tabs until user is created
  const tabs: OnboardingTab[] = [
    {
      id: 1,
      key: 'user-details',
      label: 'User Details',
      description: 'Basic user registration',
      isLocked: false, // Always unlocked
      isCompleted: isUserCreated,
    },
    {
      id: 2,
      key: 'job-details',
      label: 'Job Details',
      description: 'Professional work information',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 3,
      key: 'general-details',
      label: 'General Details',
      description: 'Personal information',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 4,
      key: 'banking-details',
      label: 'Banking Details',
      description: 'Bank account information',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 5,
      key: 'employment-history',
      label: 'Employment History',
      description: 'Work experience timeline',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 6,
      key: 'skills-set',
      label: 'Skills Set',
      description: 'Skills and certifications',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 7,
      key: 'document-pool',
      label: 'Document Pool',
      description: 'Upload documents',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 8,
      key: 'promotion-history',
      label: 'Event History',
      description: 'Career progression timeline',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 9,
      key: 'leave-details',
      label: 'Leave Details',
      description: 'Leave balance & history',
      isLocked: !isUserCreated,
      isCompleted: false,
    },
  ];

  // Note: getCurrentForm() was removed to avoid TypeScript union type complexity issues
  // Handle form submission for current tab
  const handleSubmit = async () => {
    // List of forms that have validation implemented
    const formsWithValidation = ['user-details', 'job-details', 'banking-details', 'general-details'];
    
    // Validate form only for implemented forms
    let isValid = true;
    if (formsWithValidation.includes(activeTab)) {
      if (activeTab === 'user-details') {
        isValid = await userDetailsForm.trigger();
      } else if (activeTab === 'job-details') {
        isValid = await jobDetailsForm.trigger();
      } else if (activeTab === 'banking-details') {
        isValid = await bankingDetailsForm.trigger();
      } else if (activeTab === 'general-details') {
        isValid = await generalDetailsForm.trigger();
      }
    }
    
    if (!isValid) return;

    try {
      if (activeTab === 'user-details' && mode === 'create') {
        // Onboard new user using context API
        const formData = userDetailsForm.getValues();
        const carrier: UserDetailsCarrier = {
          ...formData,
          createdAt: new Date().toISOString(),
        };

        const result = await onboardUser(carrier);
        
        if (result) {
          setUserId(result.employeeId);
          setIsUserCreated(true);
          
          // Switch to edit mode for this user
          setSearchParams({ mode: 'edit', id: result.employeeId });
          
          // Move to next tab
          setActiveTab('general-details');
        }
      } else {
        // Update existing user data (edit mode or other tabs)
        let formData: any;
        switch (activeTab) {
          case 'job-details':
            formData = jobDetailsForm.getValues();
            break;
          case 'general-details':
            formData = generalDetailsForm.getValues();
            break;
          case 'banking-details':
            formData = bankingDetailsForm.getValues();
            break;
          case 'employment-history':
            formData = employmentHistoryForm.getValues();
            break;
          case 'skills-set':
            formData = skillsSetForm.getValues();
            break;
          case 'document-pool':
            formData = documentPoolForm.getValues();
            break;
          case 'promotion-history':
            formData = promotionHistoryForm.getValues();
            break;
          default:
            return;
        }

        console.log(`Updating ${activeTab} for user ${userId}:`, formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: 'Changes saved',
          description: `${activeTab.replace('-', ' ')} updated successfully`,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/user-management');
  };

  // Get action bar configuration based on mode and tab
  const getActionBarConfig = () => {
    if (mode === 'create' && activeTab === 'user-details') {
      return {
        submitLabel: 'Create Employee & Continue',
        submitDisabled: isLoading,
      };
    }
    
    return {
      submitLabel: 'Save Changes',
      submitDisabled: isLoading,
    };
  };

  if (isInitialLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employee data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      toolbar={
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/user-management')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === 'create' ? 'Employee Onboarding' : 'Edit Employee'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {mode === 'create' 
                  ? 'Fill in user details to create employee account'
                  : `Update employee information${userId ? ` • ID: ${userDetailsForm.watch('employeeId') || userId}` : ''}`
                }
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <OnboardingTabsNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          {/* User Details Tab */}
          <TabsContent value="user-details" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">User Details</h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === 'create' 
                      ? 'Create a user account first. This information is required to register the employee in the system.'
                      : 'Basic user information. Update employee details below.'
                    }
                  </p>
                </div>
                <UserDetailsFormComponent form={userDetailsForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Job Details Tab */}
          <TabsContent value="job-details" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Job Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Professional work information including designation, location, and dates.
                  </p>
                </div>
                <JobDetailsFormComponent form={jobDetailsForm} />
              </Card>
            </div>
          </TabsContent>

          {/* General Details Tab */}
          <TabsContent value="general-details" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">General Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Personal information, addresses, and emergency contacts.
                  </p>
                </div>
                <GeneralDetailsFormComponent form={generalDetailsForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Banking Details Tab */}
          <TabsContent value="banking-details" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Banking Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Bank account information for salary payments and reimbursements.
                  </p>
                </div>
                <BankingDetailsFormComponent form={bankingDetailsForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Employment History Tab */}
          <TabsContent value="employment-history" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Employment History</h2>
                  <p className="text-sm text-muted-foreground">
                    Previous work experience and career timeline.
                  </p>
                </div>
                <EmploymentHistoryFormComponent form={employmentHistoryForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Skills Set Tab */}
          <TabsContent value="skills-set" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Skills Set</h2>
                  <p className="text-sm text-muted-foreground">
                    Skills, competencies, and certifications.
                  </p>
                </div>
                <SkillsSetFormComponent form={skillsSetForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Document Pool Tab */}
          <TabsContent value="document-pool" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Document Pool</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage employee documents.
                  </p>
                </div>
                <DocumentPoolFormComponent form={documentPoolForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Event History Tab */}
          <TabsContent value="promotion-history" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Event History</h2>
                  <p className="text-sm text-muted-foreground">
                    Career progression timeline including promotions, transfers, role changes, and other events.
                  </p>
                </div>
                <PromotionHistoryFormComponent form={promotionHistoryForm} />
              </Card>
            </div>
          </TabsContent>

          {/* Leave Details Tab */}
          <TabsContent value="leave-details" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold">Leave Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Leave balance, accruals, and leave history for the employee.
                  </p>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  Leave details coming soon...
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom Action Bar */}
      <FormActionBar
        onCancel={handleCancel}
        customActions={[
          {
            id: 'cancel',
            label: 'Cancel',
            onClick: handleCancel,
            variant: 'outline',
            type: 'button',
          },
          {
            id: 'submit',
            label: getActionBarConfig().submitLabel,
            onClick: handleSubmit,
            variant: 'default',
            disabled: getActionBarConfig().submitDisabled,
            loading: isLoading,
            type: 'button',
          },
        ]}
        customActionsPosition="split"
      />
    </PageLayout>
  );
}
