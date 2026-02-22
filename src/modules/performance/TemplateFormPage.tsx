import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { PerformanceTemplate } from "./types";
import { usePerformance } from "@/contexts/PerformanceContext";
import { useUserManagement } from "@/contexts/UserManagementContext";
import {
  TemplateBuilder,
  TemplateBuilderRef,
} from "./components/TemplateBuilder";
import { Department } from "@/modules/user-management/types/settings.types";
import { PageLayout } from "@/components/PageLayout";

type FormMode = "create" | "edit";

export function TemplateFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    getPerformanceTemplateById,
    createPerformanceTemplate,
    updatePerformanceTemplate,
    isLoading: contextLoading,
  } = usePerformance();
  const { refreshDepartments } = useUserManagement();
  const templateBuilderRef = useRef<TemplateBuilderRef>(null);

  // URL parameters
  const mode = (searchParams.get("mode") as FormMode) || "create";
  const templateId = searchParams.get("id");

  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // Form state for create mode
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    departmentId: "",
  });

  // Edit mode template state
  const [selectedTemplate, setSelectedTemplate] =
    useState<PerformanceTemplate | null>(null);

  // Load departments
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load template in edit mode
  useEffect(() => {
    if (mode === "edit" && templateId) {
      loadTemplate();
    }
  }, [mode, templateId]);

  // Handler functions
  const loadDepartments = async () => {
    try {
      const result = await refreshDepartments({}, 0, 100);
      if (result?.content) {
        setDepartments(result.content);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadTemplate = async () => {
    if (!templateId) return;
    try {
      setIsLoading(true);
      setFormError("");
      const template = await getPerformanceTemplateById(templateId);
      if (template) {
        setSelectedTemplate(template);
      } else {
        setFormError("Template not found");
      }
    } catch (error) {
      console.error("Error loading template:", error);
      setFormError("Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFormChange = (field: string, value: string) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCreateForm = (): boolean => {
    setFormError("");
    if (!createFormData.title.trim()) {
      setFormError("Title is required");
      return false;
    }
    if (!createFormData.description.trim()) {
      setFormError("Description is required");
      return false;
    }
    if (!createFormData.departmentId) {
      setFormError("Department is required");
      return false;
    }
    return true;
  };

  const handleCreateTemplate = async () => {
    if (!validateCreateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const carrier = {
        title: createFormData.title,
        description: createFormData.description,
        department: createFormData.departmentId,
        templateStatus: 'hold', // Default to 'hold' status
      };

      const newTemplate = await createPerformanceTemplate(carrier);
      if (newTemplate) {
        // Load the same page in edit mode with the new template ID
        navigate(`/performance-reviews/templates?mode=edit&id=${newTemplate.id}`);
      } else {
        setFormError("Failed to create template. Please try again.");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      setFormError("An error occurred while creating the template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemplate = async (templateData: PerformanceTemplate) => {
    setFormError("");
    setIsSubmitting(true);

    try {
      // Validate that we have at least one column and row for edit mode
      if (!templateData.columnIds || templateData.columnIds.length === 0) {
        setFormError("Please add at least one column");
        setIsSubmitting(false);
        return;
      }

      if (!templateData.rowIds || templateData.rowIds.length === 0) {
        setFormError("Please add at least one row");
        setIsSubmitting(false);
        return;
      }

      const carrier = {
        title: templateData.title,
        description: templateData.description,
        department: templateData.departmentId,
      };

      const updated = await updatePerformanceTemplate(
        templateData.id,
        carrier,
      );
      if (updated) {
        // Navigate back to templates list
        navigate("/performance-reviews?tab=templates");
      } else {
        setFormError("Failed to save template. Please try again.");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      setFormError("An error occurred while saving the template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBuilderClick = () => {
    if (!templateBuilderRef.current) {
      setFormError("Template builder is not ready. Please try again.");
      return;
    }

    const templateData = templateBuilderRef.current.getSaveData();
    if (templateData) {
      handleUpdateTemplate(templateData);
    } else {
      setFormError("Please fill in all required fields");
    }
  };

  const handleCancel = () => {
    navigate("/performance-reviews?tab=templates");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "create" ? "Create Template" : "Edit Template"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create"
                ? "Create a new performance review template"
                : "Update template configuration and structure"}
            </p>
          </div>
        </div>

        {/* Form Error Alert */}
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* CREATE MODE - Simple Form */}
        {mode === "create" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>Configure basic template information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Template Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Engineering Annual Review FY2026"
                      value={createFormData.title}
                      onChange={(e) =>
                        handleCreateFormChange("title", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={createFormData.departmentId}
                      onValueChange={(value) =>
                        handleCreateFormChange("departmentId", value)
                      }
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this template"
                      value={createFormData.description}
                      onChange={(e) =>
                        handleCreateFormChange("description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              After creating the template, you'll be able to add columns and
              rows to define the performance review structure.
            </p>
          </div>
        )}

        {/* EDIT MODE - Template Builder */}
        {mode === "edit" && selectedTemplate && (
          <TemplateBuilder
            ref={templateBuilderRef}
            initialTemplate={selectedTemplate}
            onSave={handleUpdateTemplate}
            onCancel={handleCancel}
            validationErrors={{}}
            departments={departments}
          />
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 z-40">
        <div className="container mx-auto flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={
              mode === "create" ? handleCreateTemplate : handleSaveBuilderClick
            }
            disabled={isSubmitting || isLoading || contextLoading}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                {mode === "create" ? "Create Template" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
