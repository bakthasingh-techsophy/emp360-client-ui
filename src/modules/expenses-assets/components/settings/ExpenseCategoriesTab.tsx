/**
 * Expense Categories Tab
 * Manage expense categories configuration
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
import { ExpenseCategoryConfig } from "../../types/settings.types";
import { useExpenseManagement } from "@/contexts/ExpenseManagementContext";
import { useCompany } from "@/contexts/CompanyContext";
import { CompanyAssignmentModal } from "@/components/context-aware/CompanyAssignmentModal";
import { GenericToolbar } from "@/components/GenericToolbar/GenericToolbar";
import UniversalSearchRequest from "@/types/search";

const expenseCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  companyIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const expenseCategoriesFormSchema = z.object({
  items: z
    .array(expenseCategorySchema)
    .min(1, "At least one expense category is required"),
});

type ExpenseCategoriesFormData = z.infer<typeof expenseCategoriesFormSchema>;

export function ExpenseCategoriesTab() {
  const {
    createExpenseCategory,
    updateExpenseCategory,
    searchExpenseCategories,
    deleteExpenseCategory,
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

  const form = useForm<ExpenseCategoriesFormData>({
    resolver: zodResolver(expenseCategoriesFormSchema),
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
        item.category?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  // Load expense categories on mount
  const loadExpenseCategories = async () => {
    setIsLoadingInitial(true);
    // Build search request - no specific company filtering, load all
    const searchRequest: UniversalSearchRequest = {};
    const result = await searchExpenseCategories(searchRequest, 0, 100);
    if (result?.content) {
      setValue("items", result.content, { shouldValidate: false });
    } else {
      // Fallback to default values if no data
      const now = new Date().toISOString();
      const defaultData: ExpenseCategoryConfig[] = [
        {
          id: "EXP_CAT_001",
          category: "Office Supplies",
          description: "Office supplies and equipment",
          companyIds: [],
          createdAt: now,
        },
        {
          id: "EXP_CAT_002",
          category: "Software",
          description: "Software licenses and subscriptions",
          companyIds: [],
          createdAt: now,
        },
        {
          id: "EXP_CAT_003",
          category: "Training",
          description: "Employee training and development",
          companyIds: [],
          createdAt: now,
        },
      ];
      setValue("items", defaultData, { shouldValidate: false });
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadExpenseCategories();
  }, []);

  const columns: TableColumn<ExpenseCategoryConfig>[] = [
    {
      key: "category",
      header: "Category",
      type: "text",
      required: true,
      placeholder: "Enter category...",
      width: "180px",
      minWidth: "180px",
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

  const emptyItem: ExpenseCategoryConfig = {
    id: "",
    category: "",
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

  const handleItemsChange = (newItems: ExpenseCategoryConfig[]) => {
    setValue("items", newItems, { shouldValidate: true });
  };

  const handleSave = async (item: ExpenseCategoryConfig, index: number) => {
    console.log("handleSave called for item:", item, "at index:", index);

    // Validate current item has required fields
    if (!item.category || !item.description) {
      console.warn("Validation failed: missing required fields");
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== "";

      if (isExistingItem) {
        // Update existing expense category
        console.log("Updating expense category with ID:", item.id);

        const updatePayload = {
          category: item.category,
          description: item.description,
          companyIds: item.companyIds,
          updatedAt: new Date().toISOString(),
        };

        console.log(
          "Calling updateExpenseCategory with payload:",
          updatePayload,
        );

        const result = await updateExpenseCategory(item.id, updatePayload);

        console.log("API result:", result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue("items", updatedItems);
          console.log("Item updated successfully:", result);
        }
      } else {
        // Create new expense category
        // Generate ID if not present
        const itemId = `EXP_CAT_${Date.now()}`;

        console.log("Creating expense category with ID:", itemId);

        // Create carrier object for API call
        const carrier = {
          category: item.category,
          description: item.description,
          companyIds: item.companyIds,
          createdAt: new Date().toISOString(),
        };

        console.log("Calling createExpenseCategory with carrier:", carrier);

        // Call create expense category API
        const result = await createExpenseCategory(carrier);

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
      console.error("Error saving expense category:", error);
    }
  };

  const handleDelete = async (item: ExpenseCategoryConfig, index: number) => {
    console.log("handleDelete called for item:", item, "at index:", index);

    try {
      if (!item.id || item.id.trim() === "") {
        console.warn("Cannot delete item without ID");
        return;
      }

      const success = await deleteExpenseCategory(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue("items", updatedItems, { shouldValidate: true });
        console.log("Expense category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting expense category:", error);
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
              searchPlaceholder="Search expense categories by name or description..."
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
              <p className="text-muted-foreground">
                Loading expense categories...
              </p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={(filteredItems ?? []) as ExpenseCategoryConfig[]}
              onChange={handleItemsChange}
              emptyItemTemplate={emptyItem}
              minItems={1}
              maxItems={50}
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
          title="Assign Companies to Expense Category"
          description="Select the companies this expense category applies to"
        />
      )}
    </Form>
  );
}
