/**
 * Banking Details Display Card for Self-Service Profile
 * View-only display of bank account information
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Landmark, CreditCard, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { BankingDetails } from '@/modules/user-management/types/onboarding.types';
import UniversalSearchRequest from '@/types/search';

export function BankingDetailsCard() {
  const { employeeId } = useAuth();
  const { refreshBankingDetails } = useUserManagement();
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!employeeId) return;
    setIsLoading(true);
    const searchRequest: UniversalSearchRequest = {
      filters: {
        and: {
          employeeId: employeeId,
        },
      },
    };
    const result = await refreshBankingDetails(searchRequest, 0, 1);
    if (result && result.content && result.content.length > 0) {
      setBankingDetails(result.content[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!bankingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Banking Details
          </CardTitle>
          <CardDescription>Bank account information for salary and reimbursements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No banking details found
          </div>
        </CardContent>
      </Card>
    );
  }

  const InfoField = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      </div>
      <div className="text-sm font-medium">{value || <span className="text-muted-foreground">Not provided</span>}</div>
    </div>
  );

  // Mask account number for security
  const maskAccountNumber = (account: string) => {
    if (!account) return '';
    const last4 = account.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Account Holder Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Account Holder Information
          </CardTitle>
          <CardDescription>Name and details of bank account holder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="First Name" value={bankingDetails.firstName} />
            <InfoField label="Last Name" value={bankingDetails.lastName} />
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>Primary bank account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Bank Name"
              value={bankingDetails.bankName}
              icon={Building2}
            />
            <InfoField
              label="Branch Name"
              value={bankingDetails.branchName}
              icon={MapPin}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
              </div>
              <div className="text-sm font-medium font-mono">{maskAccountNumber(bankingDetails.accountNumber)}</div>
              <Badge variant="secondary" className="w-fit text-xs">
                Masked for Security
              </Badge>
            </div>
            <InfoField label="IFSC Code" value={bankingDetails.ifscCode} />
          </div>

          {/* Info Box */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
            Bank account details are masked for security. Contact HR if you need to update your banking information.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
