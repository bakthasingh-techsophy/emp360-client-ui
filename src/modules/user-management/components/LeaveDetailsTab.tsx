/**
 * Leave Details Tab Component
 * Displays and allows editing of employee leave details in the onboarding form
 * Fetches leave information using the employee ID and renders editable cards
 * Combines LeaveDetails with LMS Configurations to form EmployeeLeavesInformation
 */

import { useEffect, useState } from "react";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { useToast } from "@/hooks/use-toast";
import { EditableLeaveCards } from "./EditableLeaveCards";
import { CreditDeductLeavesDialog, CreditDeductFormData } from "./CreditDeductLeavesDialog";
import { 
  EmployeeLeavesInformation,
  LeaveDetails,
  LMSConfiguration,
} from "../../../modules/leave-management-system/types/leaveConfiguration.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import UniversalSearchRequest from "@/types/search";

interface LeaveDetailsTabProps {
  employeeId?: string;
  onDataChange?: (data: EmployeeLeavesInformation | null) => void;
}

export function LeaveDetailsTab({
  employeeId,
  onDataChange,
}: LeaveDetailsTabProps) {
  const { getLeaveDetails, creditLeaves, deductLeaves } = useUserManagement();
  const { searchLeaveConfigurations } = useLeaveManagement();
  const { toast } = useToast();

  const [leaveData, setLeaveData] = useState<EmployeeLeavesInformation | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Credit/Deduct Dialog state
  const [creditDeductDialogOpen, setCreditDeductDialogOpen] = useState(false);
  const [creditDeductFormData, setCreditDeductFormData] = useState<CreditDeductFormData>({
    leaveTypeId: "",
    category: "",
    count: "",
    actionType: "credit",
  });
  const [creditDeductTargetLeaveTypeId, setCreditDeductTargetLeaveTypeId] = useState<string>("");
  const [isProcessingCredit, setIsProcessingCredit] = useState(false);

  // Fetch leave details on mount or when employeeId changes
  useEffect(() => {
    if (!employeeId) {
      setError("No employee ID provided");
      setLeaveData(null);
      return;
    }

    fetchLeaveDetails();
  }, [employeeId]);

  const fetchLeaveDetails = async () => {
    if (!employeeId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch leave details for the employee
      const leaveDetailsResponse = await getLeaveDetails(employeeId);

      if (!leaveDetailsResponse) {
        setError("Failed to load leave details");
        return;
      }

      const leaveDetails = leaveDetailsResponse as LeaveDetails;

      // Fetch configurations for all assigned leave types
      const searchRequest: UniversalSearchRequest = {
        searchText: "",
        searchFields: ["code"],
        filters: {
          and: {
            code: leaveDetails.assignedLeaveTypes,
          },
        },
        sort: {},
      };

      const configResponse = await searchLeaveConfigurations(
        searchRequest,
        0,
        100 // Fetch up to 100 configurations
      );

      // Build configurations map from response
      const configurations: Record<string, LMSConfiguration> = {};
      if (configResponse?.content) {
        configResponse.content.forEach((config: LMSConfiguration) => {
          configurations[config.code] = config;
        });
      }

      // Transform LeaveDetails into EmployeeLeavesInformation
      const employeeLeavesInfo: EmployeeLeavesInformation = {
        balances: leaveDetails.balances,
        configurations,
      };

      setLeaveData(employeeLeavesInfo);
      onDataChange?.(employeeLeavesInfo);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load leave details: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCredits = async (
    leaveTypeId: string,
    action: "credit" | "deduct",
    amount: number,
  ): Promise<boolean> => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee ID is missing",
        variant: "destructive",
      });
      return false;
    }

    setIsProcessingCredit(true);

    try {
      const carrier = {
        leaveTypes: [leaveTypeId],
        employeeIds: [employeeId],
        leaveAmount: amount,
      };

      const success =
        action === "credit"
          ? await creditLeaves(carrier)
          : await deductLeaves(carrier);

      if (success) {
        toast({
          title: "Success",
          description: `Leave ${
            action === "credit" ? "credited" : "deducted"
          } successfully`,
        });

        // Refresh leave details
        await fetchLeaveDetails();
        return true;
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} leave credits`,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast({
        title: "Error",
        description: `Failed to ${action} leave credits: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessingCredit(false);
    }
  };

  const handleOpenCreditDeductDialog = (leaveTypeId: string) => {
    const config = leaveData?.configurations[leaveTypeId];
    const category = config?.category || "";
    
    setCreditDeductTargetLeaveTypeId(leaveTypeId);
    setCreditDeductFormData({
      leaveTypeId: leaveTypeId,
      category: category,
      count: "",
      actionType: "credit",
    });
    setCreditDeductDialogOpen(true);
  };

  const handleSubmitCreditDeduct = async (action: "credit" | "deduct") => {
    if (!creditDeductFormData.leaveTypeId || !creditDeductFormData.count) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await handleUpdateCredits(
      creditDeductTargetLeaveTypeId,
      action,
      parseFloat(creditDeductFormData.count),
    );
    if (success) {
      setCreditDeductDialogOpen(false);
      setCreditDeductFormData({
        leaveTypeId: "",
        category: "",
        count: "",
        actionType: "credit",
      });
    }
  };

  if (!employeeId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Missing Information</AlertTitle>
        <AlertDescription>
          Employee ID is required to display leave details
        </AlertDescription>
      </Alert>
    );
  }

  if (error && !leaveData) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Leave Details</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchLeaveDetails} disabled={isLoading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {isLoading ? "Retrying..." : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <EditableLeaveCards
        employeeLeavesInfo={leaveData}
        onCreditDeduct={handleOpenCreditDeductDialog}
        isLoading={isLoading}
      />

      {!leaveData && !isLoading && !error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Leave Data</AlertTitle>
          <AlertDescription>
            No leave types have been assigned to this employee yet
          </AlertDescription>
        </Alert>
      )}

      {/* Credit/Deduct Dialog */}
      <CreditDeductLeavesDialog
        open={creditDeductDialogOpen}
        onOpenChange={setCreditDeductDialogOpen}
        formData={creditDeductFormData}
        onFormDataChange={setCreditDeductFormData}
        targetIds={employeeId ? [employeeId] : []}
        isBulk={false}
        onSubmit={handleSubmitCreditDeduct}
        isSubmitting={isProcessingCredit}
      />
    </div>
  );
}
