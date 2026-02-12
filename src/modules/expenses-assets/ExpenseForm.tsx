/**
 * Expense Form - Parent Form Component
 * Integrates multiple branch forms for expense/advance management
 * Modes: create, edit&id=xxx
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PageLayout } from "@/components/PageLayout";
import { FormHeader } from "@/components/common/FormHeader";
import { GeneralInformationFormBranch } from "./components/GeneralInformationFormBranch";
import { ExpenseItemsFormBranch } from "./components/ExpenseItemsFormBranch";
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
  const [searchParams] = useSearchParams();

  // Get mode and id from URL params
  const mode = searchParams.get("mode") || "create"; // create, edit
  const id = searchParams.get("id");
  const isEdit = mode === "edit" && !!id;

  // Context hooks
  const { createExpense, updateExpense, getExpenseDetails, isLoading } =
    useExpenseManagement();
  const { user } = useAuth();

  // Get type from URL params, default to 'expense'
  const claimType: ExpenseType =
    (searchParams.get("type") as ExpenseType) || "expense";

  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormData>({
    defaultValues: {
      type: claimType,
      raisedFor: "myself",
      description: "",
      lineItems: [],
      temporaryPersonName: "",
      temporaryPersonPhone: "",
      temporaryPersonEmail: "",
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;
  const expenseType = watch("type");
  const lineItems = watch("lineItems") || [];

  // Load expense data if in edit mode
  const loadExpense = async () => {
    if (isEdit && id) {
      // Context method handles all error handling, loading states, and token validation
      const expense = await getExpenseDetails(id);
      if (expense) {
        // Update form with loaded data
        form.reset({
          type: expense.type as ExpenseType,
          raisedFor: expense.raisedFor,
          description: expense.description,
          expenseCategoryId: expense.expenseCategoryId,
          lineItems: [], // Line items loaded separately in edit mode
          temporaryPersonName: expense.temporaryPersonName || "",
          temporaryPersonPhone: expense.temporaryPersonPhone || "",
          temporaryPersonEmail: expense.temporaryPersonEmail || "",
        });
      }
    }
  };

  useEffect(() => {
    loadExpense();
  }, [isEdit, id, form]);

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
    const generalInfoValid = await form.trigger(["description", "expenseCategoryId"]);

    if (!generalInfoValid) {
      console.warn("Please fill all required fields");
      return;
    }

    const formData = form.getValues();

    if (!user) {
      console.error("User information not available");
      return;
    }

    // Determine values based on raisedFor selection
    let employeeId: string | undefined;
    let raisedByEmployeeId: string | undefined;

    if (formData.raisedFor === "myself") {
      // Raising for self
      employeeId = user?.id;
      raisedByEmployeeId = undefined; // Not needed when raising for self
    } else if (formData.raisedFor === "employee") {
      // Raising for another employee
      employeeId = formData.raisedByEmployeeId; // The selected employee
      raisedByEmployeeId = user?.id; // Current user is raising this
    } else if (formData.raisedFor === "temporary-person") {
      // Raising for temporary/external person
      employeeId = undefined; // No employee ID for temporary person
      raisedByEmployeeId = user?.id; // Current user is raising this
    }

    // Build expense carrier with minimal required fields matching backend
    const expenseCarrier: ExpenseCarrier = {
      type: formData.type || claimType,
      companyId: user?.companyId || user?.orgId || "",
      raisedFor: formData.raisedFor || "myself",
      description: formData.description,
      expenseCategoryId: formData.expenseCategoryId || "",
      createdAt: new Date().toISOString(),
      
      // Conditional fields based on raisedFor
      ...(employeeId && { employeeId }),
      ...(raisedByEmployeeId && { raisedByEmployeeId }),
      
      // Temporary person details
      ...(formData.raisedFor === "temporary-person" && {
        temporaryPersonName: formData.temporaryPersonName,
        temporaryPersonPhone: formData.temporaryPersonPhone,
        temporaryPersonEmail: formData.temporaryPersonEmail,
      }),
    };

    // Call create expense API
    const createdExpense = await createExpense(expenseCarrier);

    if (createdExpense && createdExpense.id) {
      // Navigate to edit mode with the newly created expense ID
      navigate(`/expense-management/expense?mode=edit&id=${createdExpense.id}`);
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
      ? "Create a new advance request"
      : "Create a new expense claim";
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
