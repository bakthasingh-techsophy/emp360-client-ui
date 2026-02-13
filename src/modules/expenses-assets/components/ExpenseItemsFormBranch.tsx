/**
 * Expense Items Form Branch
 * Child form component for expense line items
 */

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EditableItemsTable,
  TableColumn,
} from "@/components/common/EditableItemsTable/EditableItemsTable";
import { ExpenseFormData, ExpenseLineItem } from "../types/expense.types";
import { useExpenseManagement } from "@/contexts/ExpenseManagementContext";
import { format } from "date-fns";
import UniversalSearchRequest from "@/types/search";

interface ExpenseItemsFormBranchProps {
  form: UseFormReturn<ExpenseFormData>;
  mode: "create" | "edit";
  lineItemIds?: string[]; // IDs of line items to load in edit mode
}

export function ExpenseItemsFormBranch({
  form,
  lineItemIds = [],
}: ExpenseItemsFormBranchProps) {
  const { watch, setValue } = form;
  const [searchParams] = useSearchParams();
  const lineItems = watch("lineItems") || [];
  const expenseType = watch("type");

  // Get expense ID from URL params
  const expenseId = searchParams.get("id") || "";

  const {
    addExpenseLineItemMain,
    updateExpenseLineItem,
    deleteExpenseLineItemMain,
    searchExpenseLineItems,
  } = useExpenseManagement();

  // Load line items based on IDs
  const refreshLineItems = async () => {
    if (!lineItemIds || lineItemIds.length === 0) {
      console.log("No line item IDs to load");
      return;
    }

    console.log("Loading line items with IDs:", lineItemIds);

    // Build search request to fetch items by IDs using structured operator
    const searchRequest: UniversalSearchRequest = {
      filters: {
        and: {
          id: { op: "in" as const, values: lineItemIds },
        },
      },
    };

    const result = await searchExpenseLineItems(searchRequest, 0, 100);

    if (result && result.content) {
      console.log("Loaded line items:", result.content);
      setValue("lineItems", result.content, { shouldValidate: false });
    } else {
      console.log("No line items found");
      setValue("lineItems", [], { shouldValidate: false });
    }
  };

  // Load line items on mount when IDs are provided
  useEffect(() => {
    if (lineItemIds && lineItemIds.length > 0) {
      refreshLineItems();
    }
  }, [lineItemIds.join(",")]); // Re-run if line item IDs change

  const columns: TableColumn<ExpenseLineItem>[] = [
    {
      key: "category",
      header: "Category",
      type: "select",
      options: [
        { label: "Travel", value: "travel" },
        { label: "Accommodation", value: "accommodation" },
        { label: "Meals", value: "meals" },
        { label: "Transport", value: "transport" },
        { label: "Office Supplies", value: "office_supplies" },
        { label: "Equipment", value: "equipment" },
        { label: "Training", value: "training" },
        { label: "Entertainment", value: "entertainment" },
        { label: "Other", value: "other" },
      ],
      required: true,
      minWidth: "160px",
    },
    {
      key: "description",
      header: "Description",
      type: "text",
      required: true,
      flex: 1,
    },
    {
      key: "fromDate",
      header: "From Date",
      type: "date",
      required: true,
      minWidth: "140px",
    },
    {
      key: "toDate",
      header: "To Date",
      type: "date",
      required: true,
      minWidth: "140px",
    },
    {
      key: "amount",
      header: "Amount",
      type: "number",
      required: true,
      align: "right",
      minWidth: "120px",
    },
    {
      key: "attachments",
      header: "Documents",
      type: "documents",
      minWidth: "120px",
    },
  ];

  const handleItemsChange = (items: ExpenseLineItem[]) => {
    setValue("lineItems", items, { shouldValidate: true });
  };

  const handleSave = async (item: ExpenseLineItem, index: number) => {
    console.log("handleSave called for line item:", item, "at index:", index);

    // Validate required fields
    if (
      !item.category ||
      !item.description ||
      !item.amount ||
      !item.fromDate ||
      !item.toDate
    ) {
      console.warn("Validation failed: missing required fields");
      return;
    }

    // Check if this is an existing item (has a valid ID from server and doesn't start with 'temp-')
    const isExistingItem = item.id && !item.id.startsWith("temp-");

    if (isExistingItem) {
      // Update existing line item
      console.log("Updating line item with ID:", item.id);

      const updatePayload = {
        category: item.category,
        description: item.description,
        amount: item.amount,
        fromDate: item.fromDate,
        toDate: item.toDate,
        notes: item.notes,
        updatedAt: new Date().toISOString(),
      };

      console.log("Calling updateExpenseLineItem with payload:", updatePayload);

      const result = await updateExpenseLineItem(item.id, updatePayload);

      console.log("API result:", result);

      if (result) {
        // Update the item with any returned data
        const updatedItems = [...lineItems];
        updatedItems[index] = result;
        setValue("lineItems", updatedItems);
        console.log("Line item updated successfully:", result);
      }
    } else {
      // Create new line item
      console.log("Creating new line item for expense:", expenseId);

      // Create carrier object for API call
      const carrier = {
        id: item.id || `LI-${Date.now()}`, // Use item ID or generate new one
        expenseId: expenseId, // Set from URL params
        category: item.category,
        description: item.description,
        amount: item.amount,
        fromDate: item.fromDate,
        toDate: item.toDate,
        notes: item.notes,
        attachments: item.attachments || [], // TODO: Handle attachments later
        createdAt: new Date().toISOString(),
      };

      console.log("Calling addExpenseLineItemMain with carrier:", carrier);

      // Call add line item API - returns updated Expense
      const result = await addExpenseLineItemMain(expenseId, carrier);

      console.log("API result:", result);

      if (result) {
        // The API returns the updated Expense, we need to extract the line items
        // For now, just update the item with the carrier data (backend should return the created item)
        const updatedItems = [...lineItems];
        updatedItems[index] = {
          ...carrier,
          attachments: carrier.attachments || [],
        };
        setValue("lineItems", updatedItems);
        console.log("Line item added successfully:", result);
      }
    }
  };

  const handleDelete = async (item: ExpenseLineItem, index: number) => {
    console.log("handleDelete called for line item:", item, "at index:", index);

    // If item doesn't have a server ID (temp-xxx), just remove from form
    if (!item.id || item.id.startsWith("temp-")) {
      console.log("Removing unsaved line item from form");
      const updatedItems = lineItems.filter((_: any, i: number) => i !== index);
      setValue("lineItems", updatedItems, { shouldValidate: true });
      return;
    }

    // Delete from server - returns updated Expense
    const result = await deleteExpenseLineItemMain(expenseId, item.id);

    if (result) {
      // Remove the item from the form state
      const updatedItems = lineItems.filter((_: any, i: number) => i !== index);
      setValue("lineItems", updatedItems, { shouldValidate: true });
      console.log("Line item deleted successfully");
    }
  };

  const handleDocumentsChange = (itemIndex: number, files: File[]) => {
    const updatedItems = [...lineItems];
    // Convert File objects to ExpenseAttachment format
    const newAttachments = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      attachments: newAttachments,
    };
    setValue("lineItems", updatedItems, { shouldValidate: true });
  };

  const getDocuments = (_itemIndex: number): File[] => {
    // Return empty array as we're storing as ExpenseAttachment objects
    // The EditableItemsTable will handle the display
    return [];
  };

  const createEmptyItem = (): ExpenseLineItem => ({
    id: `temp-${Date.now()}`,
    expenseId: expenseId, // Set from URL params
    category: "travel",
    description: "",
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    amount: 0,
    attachments: [],
    createdAt: new Date().toISOString(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expenseType === "advance"
            ? "Advance Request Items"
            : "Expense Items"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditableItemsTable
          columns={columns as any}
          items={lineItems as any}
          onChange={handleItemsChange as any}
          emptyItemTemplate={createEmptyItem() as any}
          minItems={1}
          onDocumentsChange={handleDocumentsChange}
          getDocuments={getDocuments}
          allowSave={true}
          onSave={handleSave as any}
          onDelete={handleDelete as any}
          showAddButton={true}
          allowRemove={true}
          allowAdd={true}
        />
      </CardContent>
    </Card>
  );
}
