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
import { ExpenseFormData, ExpenseType } from "./types/expense.types";
import { format } from "date-fns";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";

export function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  // Get type from URL params, default to 'expense'
  const claimType: ExpenseType =
    (searchParams.get("type") as ExpenseType) || "expense";

  // Find expense if editing
  const existingExpense = isEdit ? mockExpenses.find((e) => e.id === id) : null;

  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormData>({
    defaultValues: {
      type: existingExpense?.type || claimType,
      employeeName: existingExpense?.employeeName || "",
      employeeEmail: existingExpense?.employeeEmail || "",
      department: existingExpense?.department || "",
      description: existingExpense?.description || "",
      lineItems: existingExpense?.lineItems || [
        {
          id: `temp-${Date.now()}`,
          category: 'travel',
          description: '',
          fromDate: format(new Date(), 'yyyy-MM-dd'),
          toDate: format(new Date(), 'yyyy-MM-dd'),
          amount: 0,
          attachments: [],
        },
      ],
    },
  });

  const { handleSubmit, watch, formState: { isSubmitting } } = form;
  const expenseType = watch('type');
  const lineItems = watch('lineItems') || [];

  // Update form when expense type changes from URL
  useEffect(() => {
    if (claimType) {
      form.setValue('type', claimType);
    }
  }, [claimType, form]);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const onSubmitDraft = async (data: ExpenseFormData) => {
    console.log("Saving draft...", { ...data, status: 'draft', amount: calculateTotal() });
    // API call to save draft
    setTimeout(() => {
      navigate("/expense-management");
    }, 1000);
  };

  const onSubmitForApproval = handleSubmit(async (data: ExpenseFormData) => {
    console.log("Submitting for approval...", { ...data, status: 'pending', amount: calculateTotal() });
    // API call to submit
    setTimeout(() => {
      navigate("/expense-management");
    }, 1000);
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
            <GeneralInformationFormBranch form={form} mode={isEdit ? 'edit' : 'create'} />

            {/* Branch Form 2: Expense Items */}
            <ExpenseItemsFormBranch form={form} mode={isEdit ? 'edit' : 'create'} />

            {/* Total Amount Display */}
            {calculateTotal() > 0 && (
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
            <FormActionBar
              mode={isEdit ? "edit" : "create"}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              submitText="Submit for Approval"
              leftContent={
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                  onClick={handleSubmit(onSubmitDraft)}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </button>
              }
            />
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
