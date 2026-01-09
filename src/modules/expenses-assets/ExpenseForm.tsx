/**
 * Expense Claim Form Component
 * Create or edit expense claim or advance request with multiple line items
 */

import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { FormActionBar } from "@/components/common/FormActionBar";
import {
  EditableItemsTable,
  TableColumn,
} from "@/components/common/EditableItemsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormHeader } from "@/components/common/FormHeader";
import { mockExpenses } from "./data/mockData";
import {
  ExpenseCategory,
  ExpenseLineItem,
  ExpenseType,
} from "./types/expense.types";
import { EXPENSE_CATEGORY_LABELS } from "./constants/expense.constants";

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

  // Header form data
  const [headerData, setHeaderData] = useState<{
    type: ExpenseType;
    description: string;
  }>({
    type: (existingExpense?.type || claimType) as ExpenseType,
    description: existingExpense?.description || "",
  });

  // Raising for options
  const [raisingFor, setRaisingFor] = useState<
    "myself" | "employee" | "temporary-person"
  >("myself");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [temporaryPersonName, setTemporaryPersonName] = useState<string>("");
  const [temporaryPersonPhone, setTemporaryPersonPhone] = useState<string>("");
  const [temporaryPersonEmail, setTemporaryPersonEmail] = useState<string>("");
  const [advanceAmount, setAdvanceAmount] = useState<string>("");

  // Line items
  const [lineItems, setLineItems] = useState<Partial<ExpenseLineItem>[]>(
    existingExpense?.lineItems || [
      {
        id: `temp-${Date.now()}`,
        category: "travel" as ExpenseCategory,
        description: "",
        amount: 0,
        fromDate: "",
        toDate: "",
        notes: "",
        attachments: [],
      },
    ]
  );

  // Document storage (index -> files mapping)
  const [documents, setDocuments] = useState<Record<number, File[]>>({});

  const [isSaving, setIsSaving] = useState(false);

  const handleHeaderChange = (field: string, value: unknown) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentsChange = (index: number, files: File[]) => {
    setDocuments((prev) => ({ ...prev, [index]: files }));
  };

  const getDocuments = (index: number): File[] => {
    return documents[index] || [];
  };

  const calculateTotal = () => {
    if (headerData.type === "advance") {
      return parseFloat(advanceAmount) || 0;
    }
    return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    console.log("Saving draft...", { headerData, lineItems, documents });
    setTimeout(() => {
      setIsSaving(false);
      navigate("/expense-management");
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("Submitting expense claim...", {
      headerData,
      lineItems,
      documents,
    });
    setTimeout(() => {
      setIsSaving(false);
      navigate("/expense-management");
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/expense-management");
  };

  // Define columns for the editable table
  const lineItemColumns: TableColumn<Partial<ExpenseLineItem>>[] = [
    {
      key: "category",
      header: "Category",
      type: "select",
      required: true,
      align: "left",
      options: Object.entries(EXPENSE_CATEGORY_LABELS).map(
        ([value, label]) => ({
          label,
          value,
        })
      ),
    },
    {
      key: "description",
      header: "Description",
      type: "text",
      required: true,
      minWidth: "200px",
      flex: 1,
      placeholder: "e.g., Flight from LAX to JFK",
      align: "left",
    },
    {
      key: "fromDate",
      header: "From Date",
      type: "date",
      required: true,
      minWidth: "150px",
      align: "center",
      placeholder: "Start date",
    },
    {
      key: "toDate",
      header: "To Date",
      type: "date",
      required: true,
      minWidth: "150px",
      align: "center",
      placeholder: "End date",
    },
    {
      key: "amount",
      header: "Amount",
      type: "number",
      required: true,
      align: "center",
      min: 0,
      step: 0.01,
      placeholder: "0.00",
    },
    {
      key: "documents",
      header: "Documents",
      type: "documents",
      minWidth: "130px",
      align: "center",
    },
  ];

  const emptyLineItem: Partial<ExpenseLineItem> = {
    id: `temp-${Date.now()}`,
    category: "travel" as ExpenseCategory,
    description: "",
    amount: 0,
    fromDate: "",
    toDate: "",
    notes: "",
    attachments: [],
  };

  const getFormTitle = () => {
    if (isEdit) {
      return headerData.type === "advance"
        ? "Edit Advance Request"
        : "Edit Expense Claim";
    }
    return headerData.type === "advance"
      ? "New Advance Request"
      : "New Expense Claim";
  };

  const getFormDescription = () => {
    if (isEdit) {
      return headerData.type === "advance"
        ? "Update your advance request details"
        : "Update your expense claim details";
    }
    return headerData.type === "advance"
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information */}
            <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Provide overall details about this{" "}
                {headerData.type === "expense"
                  ? "expense claim"
                  : "advance request"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Raising For */}
              <div className="space-y-3">
                <Label>
                  Raising this{" "}
                  {headerData.type === "expense" ? "claim" : "request"} for *
                </Label>
                <RadioGroup
                  value={raisingFor}
                  onValueChange={(value) =>
                    setRaisingFor(
                      value as "myself" | "employee" | "temporary-person"
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="myself" id="myself" />
                    <Label
                      htmlFor="myself"
                      className="font-normal cursor-pointer"
                    >
                      Myself
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employee" id="employee" />
                    <Label
                      htmlFor="employee"
                      className="font-normal cursor-pointer"
                    >
                      Another Employee
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="temporary-person"
                      id="temporary-person"
                    />
                    <Label
                      htmlFor="temporary-person"
                      className="font-normal cursor-pointer"
                    >
                      Temporary/External Person
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Employee Selection */}
              {raisingFor === "employee" && (
                <div className="space-y-2">
                  <Label htmlFor="employee-select">Select Employee *</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user-001">
                        John Doe - Engineering
                      </SelectItem>
                      <SelectItem value="user-002">
                        Jane Smith - Marketing
                      </SelectItem>
                      <SelectItem value="user-003">
                        Mike Johnson - Engineering
                      </SelectItem>
                      <SelectItem value="user-004">
                        Sarah Williams - Marketing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the employee for whom you are raising this{" "}
                    {headerData.type === "expense" ? "claim" : "request"}
                  </p>
                </div>
              )}

              {/* Temporary Person Details */}
              {raisingFor === "temporary-person" && (
                <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium">Person Details</p>
                  <div className="space-y-2">
                    <Label htmlFor="temp-name">Full Name *</Label>
                    <Input
                      id="temp-name"
                      value={temporaryPersonName}
                      onChange={(e) => setTemporaryPersonName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temp-phone">Phone Number</Label>
                    <Input
                      id="temp-phone"
                      type="tel"
                      value={temporaryPersonPhone}
                      onChange={(e) => setTemporaryPersonPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temp-email">Email Address</Label>
                    <Input
                      id="temp-email"
                      type="email"
                      value={temporaryPersonEmail}
                      onChange={(e) => setTemporaryPersonEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * At least phone number or email is required
                  </p>
                </div>
              )}

              {/* Claim Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Claim Description *</Label>
                <Textarea
                  id="description"
                  value={headerData.description}
                  onChange={(e) =>
                    handleHeaderChange("description", e.target.value)
                  }
                  placeholder={
                    headerData.type === "expense"
                      ? "e.g., Business trip to San Francisco for client meeting"
                      : "e.g., Advance for upcoming conference in New York"
                  }
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a brief summary of the purpose for this{" "}
                  {headerData.type === "expense" ? "claim" : "advance"}
                </p>
              </div>

              {/* Advance Amount (only for advance type) */}
              {headerData.type === "advance" && (
                <div className="space-y-2">
                  <Label htmlFor="advance-amount">Advance Amount ($) *</Label>
                  <Input
                    id="advance-amount"
                    type="number"
                    step="0.01"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items - Only for expense type */}
          {headerData.type === "expense" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Expense Items</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add all expenses from your trip. Edit cells directly in the
                    table.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <EditableItemsTable
                  columns={lineItemColumns}
                  items={lineItems}
                  onChange={setLineItems}
                  emptyItemTemplate={emptyLineItem}
                  minItems={1}
                  maxItems={50}
                  onDocumentsChange={handleDocumentsChange}
                  getDocuments={getDocuments}
                />

                {/* Total */}
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Total Claim Amount
                    </div>
                    <div className="text-2xl font-bold">
                      ${calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total Amount Display */}
          {calculateTotal() > 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <span className="font-semibold">
                Total {headerData.type === "advance" ? "Advance" : "Claim"}{" "}
                Amount
              </span>
              <span className="text-2xl font-bold text-primary">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          )}

          {/* Form Action Bar */}
          <FormActionBar
            mode={isEdit ? "edit" : "create"}
            isSubmitting={isSaving}
            onCancel={handleCancel}
            submitText="Submit for Approval"
            leftContent={
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                Save as Draft
              </Button>
            }
          />
        </form>
        </div>
      </div>
    </PageLayout>
  );
}
