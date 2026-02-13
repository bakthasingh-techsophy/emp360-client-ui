/**
 * Intimation Form - Parent Form Component
 * Main form for creating intimation requests
 * Follows expense pattern with Save & Next flow
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PageLayout } from "@/components/PageLayout";
import { FormHeader } from "@/components/common/FormHeader";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";
import { IntimationGeneralInformationBranch } from "./components/IntimationGeneralInformationBranch";
import {
  JourneyFormBranch,
  JourneyFormBranchRef,
} from "./components/JourneyFormBranch";
import { OtherFormBranch } from "./components/OtherFormBranch";
import {
  IntimationFormData,
  IntimationType,
  IntimationCarrier,
  JourneySegment,
} from "./types/intimation.types";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutContext } from "@/contexts/LayoutContext";
import { useExpenseManagement } from "@/contexts/ExpenseManagementContext";

export function IntimationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { setHideCompanySelector } = useLayoutContext();
  const { createIntimationRequest, getIntimationDetailsMain, isLoading } =
    useExpenseManagement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const journeyFormRef = useRef<JourneyFormBranchRef>(null);

  // Determine mode based on whether we have an ID
  const isEdit = !!id;

  // Hide company selector in header for this route
  useEffect(() => {
    setHideCompanySelector(true);
    return () => {
      setHideCompanySelector(false);
    };
  }, [setHideCompanySelector]);

  // Get type from URL params, default to 'travel'
  const intimationType: IntimationType =
    (searchParams.get("type") as IntimationType) || "travel";

  // Initialize form with react-hook-form
  const form = useForm<IntimationFormData>({
    defaultValues: {
      type: intimationType,
      companyId: "",
      raisedFor: "myself",
      employeeId: "emp001", // Default to emp001 for "myself"
      raisedByEmployeeId: "",
      description: "",
      journeySegments: [],
      temporaryPersonName: "",
      temporaryPersonPhone: "",
      temporaryPersonEmail: "",
    },
  });

  const { watch, setValue } = form;
  const currentType = watch("type");
  const journeySegments = watch("journeySegments") || [];
  const description = watch("description") || "";

  // Load intimation data in edit mode
  const loadIntimationData = async () => {
    if (!isEdit || !id) return;

    setIsLoadingData(true);
    const intimation = await getIntimationDetailsMain(id);
    setIsLoadingData(false);

    if (intimation) {
      // Populate form with loaded data
      setValue("type", intimation.type);
      setValue("companyId", intimation.companyId);
      setValue("raisedFor", intimation.raisedFor);
      setValue("employeeId", intimation.employeeId || "");
      setValue("raisedByEmployeeId", intimation.raisedByEmployeeId || "");
      setValue("description", intimation.description || "");

      // Temporary person details
      if (intimation.raisedFor === "temporary-person") {
        setValue("temporaryPersonName", intimation.temporaryPersonName || "");
        setValue("temporaryPersonPhone", intimation.temporaryPersonPhone || "");
        setValue("temporaryPersonEmail", intimation.temporaryPersonEmail || "");
      }

      // Load journey segments for travel type
      if (intimation.type === "travel" && Array.isArray(intimation.data)) {
        setValue("journeySegments", intimation.data as JourneySegment[]);
      }
    }
  };
  useEffect(() => {
    loadIntimationData();
  }, [id, isEdit]);

  // Handle journey segments change
  const handleJourneySegmentsChange = (segments: JourneySegment[]) => {
    setValue("journeySegments", segments, { shouldValidate: true });
  };

  // Handle description change (for 'other' type)
  const handleDescriptionChange = (value: string) => {
    setValue("description", value, { shouldValidate: true });
  };

  // Save general information and add journey/details (Save & Next)
  const onSaveGeneralInfoAndProceed = async () => {
    // Validate general information fields
    const generalInfoValid = await form.trigger([
      "companyId",
      "type",
      "description",
    ]);

    if (!generalInfoValid) {
      return;
    }

    const formData = form.getValues();

    if (!user) {
      return;
    }

    // Build intimation carrier
    const intimationCarrier: IntimationCarrier = {
      type: formData.type,
      companyId: formData.companyId,
      raisedFor: formData.raisedFor || "myself",
      description: formData.description,
      createdAt: new Date().toISOString(),

      // Conditional fields based on raisedFor
      ...(formData.employeeId && { employeeId: formData.employeeId }),
      ...(formData.raisedByEmployeeId && {
        raisedByEmployeeId: formData.raisedByEmployeeId,
      }),

      // Temporary person details
      ...(formData.raisedFor === "temporary-person" && {
        temporaryPersonName: formData.temporaryPersonName,
        temporaryPersonPhone: formData.temporaryPersonPhone,
        temporaryPersonEmail: formData.temporaryPersonEmail,
      }),

      // Initialize data based on type
      data: formData.type === "travel" ? [] : "",
    };

    setIsSubmitting(true);

    // Call create intimation request API through context
    const createdIntimation = await createIntimationRequest(intimationCarrier);

    setIsSubmitting(false);

    if (createdIntimation && createdIntimation.id) {
      // Navigate to edit mode with the newly created intimation ID
      navigate(`/expense-management/intimation/edit/${createdIntimation.id}`);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (currentType === "travel") {
      // Use the journey form's validation
      if (journeyFormRef.current) {
        const isValid = journeyFormRef.current.validate();
        if (!isValid) {
          // Scroll to top to show errors
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
      }
    } else if (currentType === "other") {
      if (!description || description.trim() === "") {
        return false;
      }
    }

    return true;
  };

  // Handle form submission (Submit for Approval)
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = form.getValues();

    // Calculate total estimated cost for travel type
    let totalCost = 0;
    if (currentType === "travel" && formData.journeySegments) {
      totalCost = formData.journeySegments.reduce(
        (sum, seg) => sum + Number(seg.totalCost || 0),
        0,
      );
    }

    // Prepare payload - remove UI-only fields
    const cleanedJourneys = formData.journeySegments?.map((seg) => ({
      id: seg.id,
      from: seg.from,
      to: seg.to,
      fromDate: seg.fromDate,
      toDate: seg.toDate,
      modeOfTransport: seg.modeOfTransport,
      notes: seg.notes,
      costBreakdown: seg.costBreakdown,
      totalCost: seg.totalCost,
      // Exclude UI-only fields: isEditing, isSaved
    }));

    const payload = {
      type: formData.type,
      companyId: formData.companyId,
      raisedFor: formData.raisedFor,
      employeeId: formData.employeeId,
      raisedByEmployeeId: formData.raisedByEmployeeId,
      data: currentType === "travel" ? cleanedJourneys : formData.description,
      description: formData.description,
      temporaryPersonName: formData.temporaryPersonName,
      temporaryPersonPhone: formData.temporaryPersonPhone,
      temporaryPersonEmail: formData.temporaryPersonEmail,
      estimatedTotalCost: currentType === "travel" ? totalCost : undefined,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };

    console.log("Intimation Payload:", payload);

    // TODO: Implement submit for approval API call
    // For now, just navigate back

    // Navigate back to intimations tab
    navigate("/expense-management?tab=intimations");

    setIsSubmitting(false);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/expense-management?tab=intimations");
  };

  const getFormTitle = () => {
    if (isEdit) {
      return currentType === "travel"
        ? "Edit Travel Intimation"
        : "Edit Intimation";
    }
    return "New Intimation";
  };

  const getFormDescription = () => {
    if (isEdit) {
      return "Update your intimation details";
    }
    return "Notify the finance team about upcoming expenses for better planning";
  };

  // Show loading state while fetching data in edit mode
  if (isLoadingData) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium">
              Loading intimation details...
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Please wait
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex justify-center px-2 sm:px-4 lg:px-6">
        <div className="w-full max-w-[min(100%,1400px)] space-y-6 pb-24">
          {/* Header */}
          <FormHeader
            title={getFormTitle()}
            description={getFormDescription()}
            onBack={handleCancel}
          />

          <form className="space-y-6">
            {/* Branch Form 1: General Information */}
            <IntimationGeneralInformationBranch
              form={form}
              mode={isEdit ? "edit" : "create"}
            />

            {/* Branch Form 2: Journey/Other Details - Only shown in edit mode */}
            {isEdit && (
              <>
                {currentType === "travel" && (
                  <JourneyFormBranch
                    ref={journeyFormRef}
                    value={journeySegments}
                    onChange={handleJourneySegmentsChange}
                  />
                )}
                {currentType === "other" && (
                  <OtherFormBranch
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                )}
              </>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <FormActionBar
        onCancel={handleCancel}
        customActions={
          isEdit
            ? [
                {
                  id: "cancel",
                  label: "Cancel",
                  onClick: handleCancel,
                  variant: "outline",
                },
                {
                  id: "submit",
                  label: "Submit for Approval",
                  onClick: handleSubmit,
                  variant: "default",
                  loading: isSubmitting || isLoading,
                },
              ]
            : [
                {
                  id: "cancel",
                  label: "Cancel",
                  onClick: handleCancel,
                  variant: "outline",
                },
                {
                  id: "save-next",
                  label: "Save & Next",
                  onClick: onSaveGeneralInfoAndProceed,
                  variant: "default",
                  loading: isSubmitting || isLoading,
                },
              ]
        }
        customActionsPosition="split"
      />
    </PageLayout>
  );
}
