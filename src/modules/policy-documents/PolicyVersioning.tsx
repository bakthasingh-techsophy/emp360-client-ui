/**
 * Policy Version Management Page
 * Manage versions for a specific policy - view history, add new versions, update documents
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  History,
  Eye,
  Download,
  Upload,
  Link as LinkIcon,
  Plus,
  FileText,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Policy, PolicyVersion, PolicyVersionCarrier } from "./types";
import { FILE_TYPE_ICONS } from "./constants";
import { Timeline } from "@/components/timeline";
import { TimelineItem, TimelineTypeConfig } from "@/components/timeline/types";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { usePolicy } from "@/contexts/PolicyContext";

const versionFormSchema = z.object({
  versionNumber: z.string().min(1, "Version number is required"),
  sourceType: z.enum(["upload", "url"]),
  documentId: z.string().optional(),
  documentUrl: z.string().optional(),
  fileType: z.enum(["pdf", "docx"]).optional(),
  changeNotes: z.string().optional(),
});

type VersionFormData = z.infer<typeof versionFormSchema>;

export function PolicyVersioning() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get("id");
  const {
    getPolicyById,
    createPolicyVersion,
    refreshPolicyVersions,
    deletePolicyVersionById,
    updatePolicy,
  } = usePolicy();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const form = useForm<VersionFormData>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      versionNumber: "",
      sourceType: "upload",
      changeNotes: "",
    },
  });

  const loadData = async () => {
    if (policyId) {
      setLoadingData(true);
      const foundPolicy = await getPolicyById(policyId);
      if (foundPolicy) {
        setPolicy(foundPolicy);
        await loadVersions(policyId);
      }
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [policyId]);

  const loadVersions = async (policyId: string) => {
    const searchRequest = {
      filters: {
        and: {
          policyId: [policyId],
        },
      },
    };
    const result = await refreshPolicyVersions(searchRequest, 0, 100);
    if (result) {
      setVersions(result.content || []);
    }
  };

  const handleBack = () => {
    navigate("/policy-library");
  };

  const handleViewVersion = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version?.documentUrl) {
      window.open(version.documentUrl, "_blank");
    }
  };

  const handleCopyDocumentId = (documentId: string) => {
    navigator.clipboard.writeText(documentId).then(() => {
      setCopiedId(documentId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDeleteVersion = (version: PolicyVersion) => {
    setConfirmDialog({
      open: true,
      title: "Delete Version",
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete{" "}
            <strong>Version {version.versionNumber}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. The version will be permanently
            removed.
          </p>
        </div>
      ),
      variant: "destructive",
      onConfirm: async () => {
        const success = await deletePolicyVersionById(version.id);
        if (success && policyId) {
          // Refresh versions list
          await loadVersions(policyId);

          // Update policy's versionsIds
          const updatedVersionIds =
            policy?.versionsIds.filter((id) => id !== version.id) || [];
          if (policy && updatedVersionIds.length > 0) {
            await updatePolicy(policy.id, {
              versionsIds: updatedVersionIds,
              currentVersion: versions[0]?.versionNumber || "1.0",
            });
          }
        }
      },
    });
  };

  const handleSubmit = async (data: VersionFormData) => {
    setIsSubmitting(true);

    try {
      const carrier: PolicyVersionCarrier = {
        policyId: policyId!,
        versionNumber: data.versionNumber,
        documentId: data.documentId,
        documentUrl: data.documentUrl,
        sourceType: data.sourceType,
        fileType: data.fileType,
        changeNotes: data.changeNotes,
        createdAt: new Date().toISOString(),
      };

      const newVersion = await createPolicyVersion(carrier);

      if (newVersion && policy) {
        // Update policy's versionsIds and currentVersion
        const updatedVersionIds = [newVersion.id, ...policy.versionsIds];
        await updatePolicy(policy.id, {
          versionsIds: updatedVersionIds,
          currentVersion: data.versionNumber,
        });

        // Refresh versions list
        await loadVersions(policyId!);
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error creating version:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Timeline configuration
  const timelineItems: TimelineItem<PolicyVersion>[] = versions.map(
    (version) => ({
      id: version.id,
      type: "version",
      timestamp: new Date(version.createdAt),
      data: version,
    }),
  );

  const versionTypeConfig: TimelineTypeConfig<PolicyVersion> = {
    type: "version",
    renderer: (item, _isLast) => {
      const version = item.data;
      const isCurrent = version.versionNumber === policy?.currentVersion;
      const FileIcon = version.fileType
        ? FILE_TYPE_ICONS[version.fileType]
        : FileText;

      return (
        <Card
          className={cn(
            "shadow-sm",
            isCurrent && "border-primary/50 bg-primary/5",
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">
                      Version {version.versionNumber}
                    </h4>
                    {isCurrent && (
                      <Badge variant="default" className="h-5 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(version.createdAt),
                      "MMM dd, yyyy • hh:mm a",
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Direct on Large Screens */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewVersion(version.id)}
                  className="h-8"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewVersion(version.id)}
                  className="h-8"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteVersion(version)}
                    className="h-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Source</div>
                <div className="flex items-center gap-1.5 font-medium">
                  {version.sourceType === "upload" ? (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>URL</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Document ID</div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">
                    {version.documentId || "N/A"}
                  </div>
                  {version.documentId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyDocumentId(version.documentId!)}
                    >
                      {copiedId === version.documentId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">File Size</div>
                <div className="font-medium">
                  {formatFileSize(version.fileSize)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">File Type</div>
                <div className="flex items-center gap-1.5 font-medium">
                  <FileIcon className="h-3.5 w-3.5" />
                  <span>{version.fileType?.toUpperCase() || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Change Notes */}
            {version.changeNotes && (
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-1">
                  Change Notes
                </div>
                <div className="text-sm">{version.changeNotes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
    icon: {
      component: History,
      className: "text-primary",
    },
    color: {
      dot: "bg-primary",
      iconColor: "text-primary",
    },
  };

  const timelineTypeConfigs = [versionTypeConfig];

  if (loadingData || !policy) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading policy...</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Policy not found</h3>
            <Button onClick={handleBack} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Version Management</h1>
          <p className="text-xs text-muted-foreground">{policy.name}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Version
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Version</DialogTitle>
              <DialogDescription>
                Upload a new version of {policy.name}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Version Number */}
                <FormField
                  control={form.control}
                  name="versionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Version Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1.1, 2.0"
                          className="text-sm h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Use semantic versioning (e.g., 1.0, 1.1, 2.0)
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Document Source Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Document Source</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={sourceType === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSourceType("upload");
                        form.setValue("sourceType", "upload");
                      }}
                      className="flex items-center gap-2 h-8 text-xs"
                    >
                      <Upload className="h-3 w-3" />
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={sourceType === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSourceType("url");
                        form.setValue("sourceType", "url");
                      }}
                      className="flex items-center gap-2 h-8 text-xs"
                    >
                      <LinkIcon className="h-3 w-3" />
                      External URL
                    </Button>
                  </div>
                </div>

                {sourceType === "upload" ? (
                  <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <Input
                              type="file"
                              accept=".pdf,.docx"
                              className="hidden"
                              id="file-upload-version"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(`DOC-${Date.now()}`);
                                  form.setValue("documentUrl", file.name);
                                  form.setValue(
                                    "fileType",
                                    file.name.endsWith(".pdf") ? "pdf" : "docx",
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor="file-upload-version"
                              className="cursor-pointer"
                            >
                              <p className="text-sm font-medium mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PDF or DOCX (MAX. 10MB)
                              </p>
                            </label>
                            {form.watch("documentUrl") && (
                              <div className="mt-3 p-2 bg-muted rounded-md">
                                <p className="text-sm font-medium text-primary">
                                  {form.watch("documentUrl")}
                                </p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="documentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Document URL *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/policy.pdf"
                            className="text-sm h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Change Notes */}
                <FormField
                  control={form.control}
                  name="changeNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Change Notes (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What changed in this version?"
                          className="text-sm min-h-[80px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Describe what's new or changed
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Version"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Policy Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">{policy.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {policy.description || "No description available"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Current Version: {policy.currentVersion}
                </Badge>
                <Badge variant="outline">
                  Total Versions: {versions.length}
                </Badge>
                <Badge variant="outline">
                  Effective:{" "}
                  {format(new Date(policy.effectiveDate), "MMM dd, yyyy")}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History ({versions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No versions found</p>
            </div>
          ) : (
            <>
              {/* Desktop Timeline View */}
              <div className="hidden md:block">
                <Timeline
                  items={timelineItems}
                  typeConfigs={timelineTypeConfigs}
                />
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {versions.map((version, _index) => {
                  const isCurrent =
                    version.versionNumber === policy?.currentVersion;
                  const FileIcon = version.fileType
                    ? FILE_TYPE_ICONS[version.fileType]
                    : FileText;

                  return (
                    <Card
                      key={version.id}
                      className={cn(
                        "shadow-sm",
                        isCurrent && "border-primary/50 bg-primary/5",
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <History className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  Version {version.versionNumber}
                                </h4>
                                {isCurrent && (
                                  <Badge
                                    variant="default"
                                    className="h-5 text-xs"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(version.createdAt),
                                  "MMM dd, yyyy • hh:mm a",
                                )}
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewVersion(version.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              {!isCurrent && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteVersion(version)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Version
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">
                              Source
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                              {version.sourceType === "upload" ? (
                                <>
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>Upload</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="h-3.5 w-3.5" />
                                  <span>URL</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">
                              Document ID
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {version.documentId || "N/A"}
                              </div>
                              {version.documentId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleCopyDocumentId(version.documentId!)
                                  }
                                >
                                  {copiedId === version.documentId ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">
                              File Size
                            </div>
                            <div className="font-medium">
                              {formatFileSize(version.fileSize)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">
                              File Type
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                              <FileIcon className="h-3.5 w-3.5" />
                              <span>
                                {version.fileType?.toUpperCase() || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Change Notes */}
                        {version.changeNotes && (
                          <div className="pt-2 border-t">
                            <div className="text-sm text-muted-foreground mb-1">
                              Change Notes
                            </div>
                            <div className="text-sm">{version.changeNotes}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        variant={confirmDialog.variant}
      />
    </div>
  );
}
