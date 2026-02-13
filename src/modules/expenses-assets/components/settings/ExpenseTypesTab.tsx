/**
 * Expense Types Tab
 * Manage expense types configuration
 * Integrated with ExpenseManagementContext for API operations
 */

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EditableItemsTable,
  TableColumn,
} from "@/components/common/EditableItemsTable";
import { Form } from "@/components/ui/form";
import { ExpenseTypeConfig } from "../../types/settings.types";
import { useExpenseManagement } from "@/contexts/ExpenseManagementContext";
import { useCompany } from "@/contexts/CompanyContext";
import { CompanyAssignmentModal } from "@/components/context-aware/CompanyAssignmentModal";
import { GenericToolbar } from "@/components/GenericToolbar/GenericToolbar";
import UniversalSearchRequest from "@/types/search";

const expenseTypeSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  companyIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const expenseTypesFormSchema = z.object({
  items: z
    .array(expenseTypeSchema)
    .min(1, "At least one expense type is required"),
});

type ExpenseTypesFormData = z.infer<typeof expenseTypesFormSchema>;

export function ExpenseTypesTab() {
  const {
    createExpenseType,
    updateExpenseType,
    searchExpenseTypes,
    deleteExpenseType,
  } = useExpenseManagement();
  const { companies } = useCompany();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state for company assignment
  const [companyModalState, setCompanyModalState] = useState<{
    isOpen: boolean;
    itemIndex: number | null;
    selectedCompanyIds: string[];
  }>({
    isOpen: false,
    itemIndex: null,
    selectedCompanyIds: [],
  });

  const form = useForm<ExpenseTypesFormData>({
    resolver: zodResolver(expenseTypesFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch("items");

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.type?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  // Load expense types on mount
  const loadExpenseTypes = async () => {
    setIsLoadingInitial(true);
    // Build search request - no specific company filtering, load all
    const searchRequest: UniversalSearchRequest = {};
    const result = await searchExpenseTypes(searchRequest, 0, 100);
    if (result?.content) {
      setValue("items", result.content, { shouldValidate: false });
    } else {
      setValue("items", [], { shouldValidate: false });
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const columns: TableColumn<ExpenseTypeConfig>[] = [
    {
      key: "type",
      header: "Type",
      type: "text",
      required: true,
      placeholder: "Enter expense type...",
      width: "200px",
      minWidth: "200px",
    },
    {
      key: "description",
      header: "Description",
      type: "text",
      required: true,
      placeholder: "Enter description...",
      flex: 1,
    },
    {
      key: "companyIds",
      header: "Companies",
      type: "multiselect",
      required: false,
      placeholder: "Select companies...",
      options: companies.map((c) => ({ value: c.id, label: c.name })),
      width: "200px",
      minWidth: "200px",
    },
  ];

  const emptyItem: ExpenseTypeConfig = {
    id: "",
    type: "",
    description: "",
    companyIds: [],
    createdAt: new Date().toISOString(),
  };

  // Handle multiselect (companies) click - opens modal
  const handleMultiselectClick = (
    columnKey: string,
    index: number,
    currentValue: string[]
  ) => {
    if (columnKey === "companyIds") {
      setCompanyModalState({
        isOpen: true,
        itemIndex: index,
        selectedCompanyIds: currentValue || [],
      });
    }
  };

  // Handle company selection in modal - automatically saves after applying
  const handleApplyCompanies = async (selectedCompanyIds: string[]) => {
    if (companyModalState.itemIndex === null) return;

    const itemIndex = companyModalState.itemIndex;
    const updatedItem = {
      ...items[itemIndex],
      companyIds: selectedCompanyIds,
    };

    // Update items state first
    const updatedItems = [...items];
    updatedItems[itemIndex] = updatedItem;
    setValue("items", updatedItems, { shouldValidate: true });

    // Close modal
    setCompanyModalState({
      isOpen: false,
      itemIndex: null,
      selectedCompanyIds: [],
    });

    // Automatically save the updated item
    await handleSave(updatedItem, itemIndex);
  };

  const handleItemsChange = (newItems: ExpenseTypeConfig[]) => {
    setValue("items", newItems, { shouldValidate: true });
  };

  const handleSave = async (item: ExpenseTypeConfig, index: number) => {
    console.log("handleSave called for item:", item, "at index:", index);

    // Validate current item has required fields
    if (!item.type || !item.description) {
      console.warn("Validation failed: missing required fields");
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== "";

      if (isExistingItem) {
        // Update existing expense type
        console.log("Updating expense type with ID:", item.id);

        const updatePayload = {
          type: item.type,
          description: item.description,
          companyIds: item.companyIds,
          updatedAt: new Date().toISOString(),
        };

        console.log("Calling updateExpenseType with payload:", updatePayload);

        const result = await updateExpenseType(item.id, updatePayload);

        console.log("API result:", result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue("items", updatedItems);
          console.log("Item updated successfully:", result);
        }
      } else {
        // Create new expense type
        // Generate ID if not present
        const itemId = `EXP_TYPE_${Date.now()}`;

        console.log("Creating expense type with ID:", itemId);

        // Create carrier object for API call
        const carrier = {
          type: item.type,
          description: item.description,
          companyIds: item.companyIds,
          createdAt: new Date().toISOString(),
        };

        console.log("Calling createExpenseType with carrier:", carrier);

        // Call create expense type API
        const result = await createExpenseType(carrier);

        console.log("API result:", result);

        if (result) {
          // Update the item with any returned data (e.g., ID from server)
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue("items", updatedItems);
          console.log("Item created successfully:", result);
        }
      }
    } catch (error) {
      console.error("Error saving expense type:", error);
    }
  };

  const handleDelete = async (item: ExpenseTypeConfig, index: number) => {
    console.log("handleDelete called for item:", item, "at index:", index);

    try {
      if (!item.id || item.id.trim() === "") {
        console.warn("Cannot delete item without ID");
        return;
      }

      const success = await deleteExpenseType(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue("items", updatedItems, { shouldValidate: true });
        console.log("Expense type deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting expense type:", error);
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {/* Toolbar with search */}
          <div className="mb-4">
            <GenericToolbar
              showSearch
              searchPlaceholder="Search expense types by name or description..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              showFilters={false}
              showExport={false}
              showConfigureView={false}
              showBulkActions={false}
            />
          </div>

          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading expense types...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={(filteredItems ?? []) as ExpenseTypeConfig[]}
              onChange={handleItemsChange}
              emptyItemTemplate={emptyItem}
              minItems={1}
              maxItems={20}
              showAddButton={true}
              allowRemove={true}
              allowAdd={true}
              allowSave={true}
              onSave={handleSave}
              onDelete={handleDelete}
              onMultiselectClick={handleMultiselectClick}
            />
          )}
        </div>
      </form>

      {/* Company Assignment Modal */}
      {companyModalState.isOpen && companyModalState.itemIndex !== null && (
        <CompanyAssignmentModal
          isOpen={companyModalState.isOpen}
          onClose={() =>
            setCompanyModalState({
              isOpen: false,
              itemIndex: null,
              selectedCompanyIds: [],
            })
          }
          onApply={handleApplyCompanies}
          selectedCompanyIds={companyModalState.selectedCompanyIds}
          companies={companies}
          title="Assign Companies to Expense Type"
          description="Select the companies this expense type applies to"
        />
      )}
    </Form>
  );
}
