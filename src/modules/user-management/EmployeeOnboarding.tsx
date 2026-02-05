/**
 * Employee Onboarding/Edit Page
 * Dual-purpose page for creating new employees and editing existing ones
 * Create Mode: Only User Details required, submit creates user and unlocks other tabs
 * Edit Mode: All tabs unlocked, fetch data based on employee ID from URL params
 */

import { FormActionBar } from "@/components/common/FormActionBar";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BankingDetailsFormComponent, bankingDetailsSchema } from "./components/onboarding/BankingDetailsForm";
import { DocumentPoolFormComponent } from "./components/onboarding/DocumentPoolForm";
import { EmploymentHistoryFormComponent, employmentHistorySchema } from "./components/onboarding/EmploymentHistoryForm";
import { GeneralDetailsFormComponent, generalDetailsSchema } from "./components/onboarding/GeneralDetailsForm";
import { JobDetailsFormComponent, jobDetailsSchema } from "./components/onboarding/JobDetailsForm";
import { OnboardingTabsNavigation } from "./components/onboarding/OnboardingTabsNavigation";
import { PromotionHistoryFormComponent } from "./components/onboarding/PromotionHistoryForm";
import { SkillsSetFormComponent, skillsSetSchema } from "./components/onboarding/SkillsSetForm";
import { UserDetailsFormComponent, userDetailsSchema } from "./components/onboarding/UserDetailsForm";
import {
  BankingDetails,
  DocumentPool,
  EmployeeType,
  EmploymentHistory,
  Gender,
  GeneralDetails,
  JobDetails,
  MaritalStatus,
  OnboardingTab,
  PromotionHistoryForm,
  SkillsSetForm,
  UserDetails,
  UserDetailsCarrier,
  UserStatus,
} from './types/onboarding.types';

export function EmployeeOnboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    onboardUser, 
    updateUser, 
    createBankingDetails, 
    updateBankingDetails, 
    isLoading 
  } = useUserManagement();

  // Determine mode and employee ID from URL params
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const employeeId = searchParams.get("id");

  // Track state
  const [activeTab, setActiveTab] = useState("user-details");
  const [isUserCreated, setIsUserCreated] = useState(mode === "edit"); // Edit mode = user already exists
  const [userId, setUserId] = useState<string | null>(employeeId);

  // Form instances for each tab
  const userDetailsForm = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: UserStatus.ACTIVE,
      createdAt: "",
      updatedAt: "",
    },
  });

  const jobDetailsForm = useForm<JobDetails>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: {
      id: "",
      email: "",
      phone: "",
      secondaryPhone: "",
      designation: "",
      employeeType: EmployeeType.FULL_TIME,
      workLocation: "",
      reportingManager: "",
      joiningDate: "",
      dateOfBirth: "",
      celebrationDOB: "",
      sameAsDOB: false,
      shift: "",
      probationPeriod: 3,
      createdAt: "",
      updatedAt: "",
    },
  });

  const generalDetailsForm = useForm<GeneralDetails>({
    resolver: zodResolver(generalDetailsSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      secondaryPhone: "",
      gender: Gender.MALE,
      bloodGroup: "",
      panNumber: "",
      aadharNumber: "",
      contactAddress: "",
      permanentAddress: "",
      sameAsContactAddress: false,
      emergencyContacts: [
        {
          id: '',
          name: '',
          relation: '',
          phone: '',
        },
      ],
      personalEmail: "",
      nationality: "",
      physicallyChallenged: false,
      passportNumber: "",
      passportExpiry: "",
      maritalStatus: MaritalStatus.SINGLE,
      createdAt: "",
      updatedAt: "",
    },
  });

  const bankingDetailsForm = useForm<BankingDetails>({
    resolver: zodResolver(bankingDetailsSchema),
    defaultValues: {
      id: "",
      employeeId: "",
      firstName: "",
      lastName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      createdAt: "",
      updatedAt: "",
    },
  });

  const employmentHistoryForm = useForm<EmploymentHistory>({
    resolver: zodResolver(employmentHistorySchema),
    defaultValues: {
      items: [],
      viewMode: "timeline",
    },
  });

  const skillsSetForm = useForm<SkillsSetForm>({
    resolver: zodResolver(skillsSetSchema),
    defaultValues: {
      items: [],
      viewMode: "view",
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

  // Tab configuration - lock tabs until user is created
  const tabs: OnboardingTab[] = [
    {
      id: 1,
      key: "user-details",
      label: "User Details",
      description: "Basic user registration",
      isLocked: false, // Always unlocked
      isCompleted: isUserCreated,
    },
    {
      id: 2,
      key: "job-details",
      label: "Job Details",
      description: "Professional work information",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 3,
      key: "general-details",
      label: "General Details",
      description: "Personal information",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 4,
      key: "banking-details",
      label: "Banking Details",
      description: "Bank account information",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 5,
      key: "employment-history",
      label: "Employment History",
      description: "Work experience timeline",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 6,
      key: "skills-set",
      label: "Skills Set",
      description: "Skills and certifications",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 7,
      key: "document-pool",
      label: "Document Pool",
      description: "Upload documents",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 8,
      key: "promotion-history",
      label: "Event History",
      description: "Career progression timeline",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
    {
      id: 9,
      key: "leave-details",
      label: "Leave Details",
      description: "Leave balance & history",
      isLocked: !isUserCreated,
      isCompleted: false,
    },
  ];

  // Note: getCurrentForm() was removed to avoid TypeScript union type complexity issues
  // Handle form submission for current tab
  const handleSubmit = async () => {
    // List of tabs that don't need save (handle their own CRUD)
    const selfManagedTabs = ["employment-history", "skills-set", "document-pool"];
    
    // List of forms that have validation implemented
    const formsWithValidation = [
      "user-details",
      "job-details",
      "banking-details",
      "general-details",
      "employment-history",
      "skills-set",
    ];

    // Validate form only for implemented forms
    let isValid = true;
    if (formsWithValidation.includes(activeTab)) {
      if (activeTab === "user-details") {
        isValid = await userDetailsForm.trigger();
      } else if (activeTab === "job-details") {
        isValid = await jobDetailsForm.trigger();
      } else if (activeTab === "banking-details") {
        isValid = await bankingDetailsForm.trigger();
      } else if (activeTab === "general-details") {
        isValid = await generalDetailsForm.trigger();
        console.log('General Details Validation:', isValid);
        console.log('General Details Errors:', generalDetailsForm.formState.errors);
      } else if (activeTab === "employment-history") {
        isValid = await employmentHistoryForm.trigger();
      } else if (activeTab === "skills-set") {
        isValid = await skillsSetForm.trigger();
      }
    }

    if (!isValid) {
      console.log('Form validation failed for tab:', activeTab);
      return;
    }

    try {
      if (activeTab === "user-details") {
        const formData = userDetailsForm.getValues();

        if (mode === "create") {
          // Onboard new user using context API
          const carrier: UserDetailsCarrier = {
            ...formData,
            createdAt: new Date().toISOString(),
          };

          const result = await onboardUser(carrier);

          if (result) {
            setUserId(result.id);
            setIsUserCreated(true);

            // Switch to edit mode for this user
            setSearchParams({ mode: "edit", id: result.id });

            // Move to next tab
            setActiveTab("general-details");
          }
        } else if (employeeId) {
          // Update existing user using updateUser
          // Check if employeeId has changed
          const currentEmployeeId = formData.id;
          const employeeIdChanged = currentEmployeeId !== employeeId;
          
          const carrier: UserDetailsCarrier = {
            ...formData,
            createdAt: formData.createdAt || new Date().toISOString(),
            employeeIdChanged: employeeIdChanged,
          };
          
          await updateUser(employeeId, carrier);
          
          // If employeeId changed, update URL params
          if (employeeIdChanged) {
            setUserId(currentEmployeeId);
            setSearchParams({ mode: "edit", id: currentEmployeeId });
          }
        }
      } else {
        // All other tabs - use updateUser
        if (!employeeId) return;

        // Skip save for self-managed tabs (they handle their own CRUD operations)
        if (selfManagedTabs.includes(activeTab)) {
          toast({
            title: "Info",
            description: "Changes are saved automatically for this section",
          });
          return;
        }

        let formData: any;
        switch (activeTab) {
          case "job-details":
            formData = jobDetailsForm.getValues();
            break;
          case "general-details":
            formData = generalDetailsForm.getValues();
            break;
          case "banking-details":
            formData = bankingDetailsForm.getValues();
            break;
          case "promotion-history":
            formData = promotionHistoryForm.getValues();
            break;
          default:
            return;
        }

        const finalPayload: any = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        // Handle banking details separately with dedicated API
        if (activeTab === "banking-details") {
          const bankingData = formData as BankingDetails;
          if (bankingData.id) {
            // Update existing banking details
            await updateBankingDetails(bankingData.id, finalPayload);
          } else {
            // Create new banking details
            const newBankingDetails = {
              ...finalPayload,
              employeeId: employeeId,
              createdAt: new Date().toISOString(),
            };
            await createBankingDetails(newBankingDetails);
          }
        } else {
          // Update user with form data from other tabs
          await updateUser(employeeId, finalPayload);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/user-management");
  };

  // Get action bar configuration based on mode and tab
  const getActionBarConfig = () => {
    if (mode === "create" && activeTab === "user-details") {
      return {
        submitLabel: "Create Employee & Continue",
        submitDisabled: isLoading,
      };
    }

    return {
      submitLabel: "Save Changes",
      submitDisabled: isLoading,
    };
  };

  return (
    <PageLayout
      toolbar={
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/user-management")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "create" ? "Employee Onboarding" : "Edit Employee"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {mode === "create"
                  ? "Fill in user details to create employee account"
                  : `Update employee information${userId ? ` • ID: ${userDetailsForm.watch("id") || userId}` : ""}`}
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
                    {mode === "create"
                      ? "Create a user account first. This information is required to register the employee in the system."
                      : "Basic user information. Update employee details below."}
                  </p>
                </div>
                <UserDetailsFormComponent
                  form={userDetailsForm}
                  employeeId={employeeId || undefined}
                  mode={mode}
                />
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
                    Professional work information including designation,
                    location, and dates.
                  </p>
                </div>
                <JobDetailsFormComponent
                  form={jobDetailsForm}
                  employeeId={employeeId || undefined}
                />
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
                <GeneralDetailsFormComponent
                  form={generalDetailsForm}
                  employeeId={employeeId || undefined}
                />
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
                    Bank account information for salary payments and
                    reimbursements.
                  </p>
                </div>
                <BankingDetailsFormComponent 
                  form={bankingDetailsForm} 
                  employeeId={employeeId || undefined}
                />
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
                <EmploymentHistoryFormComponent
                  form={employmentHistoryForm}
                  employeeId={employeeId || undefined}
                />
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
                <SkillsSetFormComponent
                  form={skillsSetForm}
                  employeeId={employeeId || undefined}
                />
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
                <DocumentPoolFormComponent 
                  form={documentPoolForm}
                  employeeId={employeeId || undefined}
                />
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
                    Career progression timeline including promotions, transfers,
                    role changes, and other events.
                  </p>
                </div>
                <PromotionHistoryFormComponent
                  form={promotionHistoryForm}
                  employeeId={employeeId || undefined}
                />
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
            id: "cancel",
            label: "Cancel",
            onClick: handleCancel,
            variant: "outline",
            type: "button",
          },
          {
            id: "submit",
            label: getActionBarConfig().submitLabel,
            onClick: handleSubmit,
            variant: "default",
            disabled: getActionBarConfig().submitDisabled,
            loading: isLoading,
            type: "button",
          },
        ]}
        customActionsPosition="split"
      />
    </PageLayout>
  );
}
