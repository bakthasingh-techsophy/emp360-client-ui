/**
 * Expense Form - Parent Form Component
 * Integrates multiple branch forms for expense/advance management
 */

import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PageLayout } from "@/components/PageLayout";
import { FormHeader } from "@/components/common/FormHeader";
import { GeneralInformationFormBranch } from "./components/GeneralInformationFormBranch";
import { ExpenseItemsFormBranch } from "./components/ExpenseItemsFormBranch";
import { mockExpenses } from "./data/mockData";
import {
  ExpenseFormData,
  ExpenseType,
  ExpenseCarrier,
} from "./types/expense.types";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";
import { useExpenseManagement } from "@/contexts/ExpenseManagementContext";
import { useAuth } from "@/contexts/AuthContext";

export function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  // Context hooks
  const { createExpense, updateExpense, isLoading } = useExpenseManagement();
  const { user } = useAuth();

  // Get type from URL params, default to 'expense'
  const claimType: ExpenseType =
    (searchParams.get("type") as ExpenseType) || "expense";

  // Find expense if editing
  const existingExpense = isEdit ? mockExpenses.find((e) => e.id === id) : null;

  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormData>({
    defaultValues: {
      type: existingExpense?.type || claimType,
      description: existingExpense?.description || "",
      lineItems: [], // Line items are loaded separately in edit mode
      isTemporaryPerson: existingExpense?.isTemporaryPerson || false,
      temporaryPersonName: existingExpense?.temporaryPersonName || "",
      temporaryPersonPhone: existingExpense?.temporaryPersonPhone || "",
      temporaryPersonEmail: existingExpense?.temporaryPersonEmail || "",
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;
  const expenseType = watch("type");
  const lineItems = watch("lineItems") || [];

  // Update form when expense type changes from URL
  useEffect(() => {
    if (claimType) {
      form.setValue("type", claimType);
    }
  }, [claimType, form]);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const onSubmitDraft = async (data: ExpenseFormData) => {
    if (!isEdit || !id) return;

    // Build update payload
    const updatePayload = {
      description: data.description,
      temporaryPersonName: data.temporaryPersonName,
      temporaryPersonPhone: data.temporaryPersonPhone,
      temporaryPersonEmail: data.temporaryPersonEmail,
      status: "draft",
    };

    // Call update expense API
    const updatedExpense = await updateExpense(id, updatePayload);

    if (updatedExpense) {
      console.log("Expense saved successfully");
      // Stay on the same page - data is updated
    }
  };

  const onSaveGeneralInfoAndAddExpenses = async () => {
    // Validate general information fields
    const generalInfoValid = await form.trigger(["description"]);

    if (!generalInfoValid) {
      console.warn("Please fill all required fields");
      return;
    }

    const formData = form.getValues();

    if (!user) {
      console.error("User information not available");
      return;
    }

    // Build expense carrier with general information
    const expenseCarrier: ExpenseCarrier = {
      type: formData.type || claimType,
      employeeId: user?.id,
      firstName: formData.firstName || user?.name?.split(" ")[0],
      lastName: formData.lastName || user?.name?.split(" ")[1],
      email: user?.email || formData.email || "",
      description: formData.description,
      lineItemIds: [],
      status: "draft",
      currentApprovalLevel: 1,
      isTemporaryPerson: formData.isTemporaryPerson,
      temporaryPersonName: formData.temporaryPersonName,
      temporaryPersonPhone: formData.temporaryPersonPhone,
      temporaryPersonEmail: formData.temporaryPersonEmail,
      createdAt: new Date().toISOString(),
    };

    // Call create expense API
    const createdExpense = await createExpense(expenseCarrier);

    if (createdExpense && createdExpense.id) {
      // Navigate to edit mode with the newly created expense ID
      navigate(`/expense-management/expense/${createdExpense.id}/edit`);
    }
  };

  const onSubmitForApproval = handleSubmit(async (data: ExpenseFormData) => {
    if (!isEdit || !id) return;

    // Build update payload with pending status
    const updatePayload = {
      description: data.description,
      temporaryPersonName: data.temporaryPersonName,
      temporaryPersonPhone: data.temporaryPersonPhone,
      temporaryPersonEmail: data.temporaryPersonEmail,
      status: "pending",
      amount: calculateTotal(),
    };

    // Call update expense API
    const updatedExpense = await updateExpense(id, updatePayload);

    if (updatedExpense) {
      console.log("Expense submitted for approval");
      navigate("/expense-management");
    }
  });

  const handleCancel = () => {
    navigate("/expense-management");
  };

  const getFormTitle = () => {
    if (isEdit) {
      return expenseType === "advance"
        ? "Edit Advance Request"
        : "Edit Expense Claim";
    }
    return expenseType === "advance"
      ? "New Advance Request"
      : "New Expense Claim";
  };

  const getFormDescription = () => {
    if (isEdit) {
      return expenseType === "advance"
        ? "Update your advance request details"
        : "Update your expense claim details";
    }
    return expenseType === "advance"
      ? "Request advance payment for upcoming expenses"
      : "Submit expenses from your business trip or activities";
  };

  return (
    <PageLayout>
      <div className="flex justify-center px-2 sm:px-4 lg:px-6">
        <div className="w-full max-w-[min(100%,1400px)] space-y-6 pb-24">
          <FormHeader
            title={getFormTitle()}
            description={getFormDescription()}
            onBack={handleCancel}
          />

          <form onSubmit={onSubmitForApproval} className="space-y-6">
            {/* Branch Form 1: General Information */}
            <GeneralInformationFormBranch
              form={form}
              mode={isEdit ? "edit" : "create"}
            />

            {/* Branch Form 2: Expense Items - Only shown in edit mode */}
            {isEdit && <ExpenseItemsFormBranch form={form} mode="edit" />}

            {/* Total Amount Display - Only in edit mode */}
            {isEdit && calculateTotal() > 0 && (
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <span className="font-semibold">
                  Total {expenseType === "advance" ? "Advance" : "Claim"} Amount
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            )}

            {/* Form Action Bar */}
            {isEdit ? (
              <FormActionBar
                mode="edit"
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                hideDefaultActions
                rightContent={
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md hover:bg-accent"
                      onClick={handleSubmit(onSubmitDraft)}
                      disabled={isLoading}
                    >
                      Save
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md hover:bg-accent"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                }
              />
            ) : (
              <FormActionBar
                mode="create"
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                hideDefaultActions
                rightContent={
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      onClick={onSaveGeneralInfoAndAddExpenses}
                      disabled={isLoading}
                    >
                      Save & Next
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md hover:bg-accent"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                }
              />
            )}
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
