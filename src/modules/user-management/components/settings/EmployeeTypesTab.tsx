/**
 * Employee Types Tab
 * Manage different employee types (Full-time, Part-time, Contract, etc.)
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EditableItemsTable,
  TableColumn,
} from "@/components/common/EditableItemsTable";
import { Form } from "@/components/ui/form";
import { EmployeeType, EmployeeTypeCarrier } from "../../types/settings.types";
import { useUserManagement } from "@/contexts/UserManagementContext";

// Zod schema for Employee Types form validation
const employeeTypeItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  employeeType: z
    .string()
    .min(1, "Employee Type is required and cannot be empty"),
  description: z.string().min(1, "Description is required and cannot be empty"),
});

const employeeTypesFormSchema = z.object({
  items: z
    .array(employeeTypeItemSchema)
    .min(1, "At least one employee type is required"),
});

type EmployeeTypesFormData = z.infer<typeof employeeTypesFormSchema>;

export function EmployeeTypesTab() {
  const { createEmployeeType, updateEmployeeType, refreshEmployeeTypes, deleteEmployeeType } = useUserManagement();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<EmployeeTypesFormData>({
    resolver: zodResolver(employeeTypesFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch("items");

  // Load employee types on mount
  const loadEmployeeTypes = async () => {
    setIsLoadingInitial(true);
    const result = await refreshEmployeeTypes({}, 0, 100);
    if (result?.content) {
      setValue("items", result.content, { shouldValidate: false });
    } else {
      // Fallback to default values if no data
      setValue("items", [
        {
          id: "EMP_TYPE_001",
          employeeType: "Full-time",
          description: "Full-time",
        },
        {
          id: "EMP_TYPE_002",
          employeeType: "Part-time",
          description: "Part-time",
        },
        {
          id: "EMP_TYPE_003",
          employeeType: "Contract",
          description: "Contract",
        },
        { id: "EMP_TYPE_004", employeeType: "Intern", description: "Intern" },
      ]);
    }
    setIsLoadingInitial(false);
  };
  useEffect(() => {
    loadEmployeeTypes();
  }, []);

  const columns: TableColumn<EmployeeType>[] = [
    {
      key: "employeeType",
      header: "Employee Type",
      type: "text",
      required: true,
      placeholder: "Enter employee type...",
      width: "250px",
      minWidth: "250px",
    },
    {
      key: "description",
      header: "Description",
      type: "text",
      required: true,
      placeholder: "Enter employee type description...",
      flex: 1,
    },
  ];

  const emptyItem: EmployeeType = {
    id: "",
    employeeType: "",
    description: "",
  };

  const handleItemsChange = (newItems: EmployeeType[]) => {
    // Transform employeeType values to uppercase with underscores
    const transformedItems = newItems.map((item) => ({
      ...item,
      employeeType: item.employeeType.toUpperCase().replace(/\s+/g, "_"),
    }));
    setValue("items", transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: EmployeeType, index: number) => {
    console.log("handleSave called for item:", item, "at index:", index);

    // Validate current item has required fields
    if (!item.employeeType || !item.description) {
      console.warn("Validation failed: missing required fields");
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== "";

      if (isExistingItem) {
        // Update existing employee type
        console.log("Updating employee type with ID:", item.id);

        const updatePayload = {
          employeeType: item.employeeType,
          description: item.description,
          updatedAt: new Date().toISOString(), // Include updatedAt for concurrency control
        };

        console.log("Calling updateEmployeeType with payload:", updatePayload);

        const result = await updateEmployeeType(item.id, updatePayload);

        console.log("API result:", result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue("items", updatedItems);
          console.log("Item updated successfully:", result);
        }
      } else {
        // Create new employee type
        // Generate ID if not present
        const itemId = `EMP_TYPE_${Date.now()}`;

        console.log("Creating employee type with ID:", itemId);

        // Create carrier object for API call
        const carrier: EmployeeTypeCarrier = {
          id: itemId,
          employeeType: item.employeeType,
          description: item.description,
          createdAt: new Date().toISOString(), // Include createdAt for concurrency control
        };

        console.log("Calling createEmployeeType with carrier:", carrier);

        // Call create employee type API
        const result = await createEmployeeType(carrier);

        console.log("API result:", result);

        if (result) {
          // Update the item with any returned data (e.g., createdAt, updatedAt)
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue("items", updatedItems);
          console.log("Item created successfully:", result);
        }
      }
    } catch (error) {
      console.error("Error saving employee type:", error);
    }
  };

  const handleDelete = async (item: EmployeeType, index: number) => {
    console.log("handleDelete called for item:", item, "at index:", index);

    try {
      if (!item.id || item.id.trim() === "") {
        console.warn("Cannot delete item without ID");
        return;
      }

      const success = await deleteEmployeeType(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue("items", updatedItems, { shouldValidate: true });
        console.log("Employee type deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting employee type:", error);
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading employee types...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={items}
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
            />
          )}
        </div>
      </form>
    </Form>
  );
}
