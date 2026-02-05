/**
 * Banking Details Form
 * Bank account information for salary and reimbursements
 * 
 * TODO: Implement the following features:
 * - Fields: accountHolderName, accountNumber, ifscCode, bankName, branchName
 * - Validation for IFSC code format
 * - Option to add multiple bank accounts (primary/secondary)
 */

/**
 * Banking Details Form
 * Bank account information for salary payments
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { BankingDetails } from '../../types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Zod schema for BankingDetails validation
export const bankingDetailsSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().optional(),
  firstName: z.string().min(2, "First name is required (min 2 characters)"),
  lastName: z.string().min(2, "Last name is required (min 2 characters)"),
  accountNumber: z.string().regex(/^[0-9]{9,18}$/, "Enter a valid account number (9-18 digits)"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g., HDFC0001234)"),
  bankName: z.string().min(3, "Bank name is required (min 3 characters)"),
  branchName: z.string().min(3, "Branch name is required (min 3 characters)"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

interface BankingDetailsFormProps {
  form: UseFormReturn<BankingDetails>;
  employeeId?: string;
}

export function BankingDetailsFormComponent({ form, employeeId }: BankingDetailsFormProps) {
  const { refreshBankingDetails } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    formState: { errors },
  } = form;

  const fetchBankingDetails = async () => {
    if (employeeId) {
      setIsLoading(true);
      // Build filter to search by employeeId
      const filters = [{ id: 'employeeId', filterId: 'employeeId', operator: 'eq', value: employeeId }];
      const result = await refreshBankingDetails(filters, '', 0, 1);
      
      // Get the first result if exists
      if (result && result.content && result.content.length > 0) {
        const data = result.content[0];
        form.reset({
          id: data.id || '',
          employeeId: data.employeeId || employeeId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          bankName: data.bankName || '',
          branchName: data.branchName || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        });
      }
      setIsLoading(false);
    }
  };

  // Fetch banking details when employeeId is available
  useEffect(() => {
    fetchBankingDetails();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading banking details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banking Information */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Provide your bank account information for salary deposits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters',
                },
              })}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters',
                },
              })}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Account Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountNumber"
              {...register('accountNumber', {
                required: 'Account number is required',
                pattern: {
                  value: /^[0-9]{9,18}$/,
                  message: 'Enter a valid account number (9-18 digits)',
                },
              })}
              placeholder="1234567890123456"
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">
              IFSC Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ifscCode"
              {...register('ifscCode', {
                required: 'IFSC code is required',
                pattern: {
                  value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                  message: 'Enter a valid IFSC code (e.g., HDFC0001234)',
                },
              })}
              placeholder="HDFC0001234"
              className="uppercase"
            />
            {errors.ifscCode && (
              <p className="text-sm text-destructive">{errors.ifscCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">
              Bank Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bankName"
              {...register('bankName', {
                required: 'Bank name is required',
                minLength: {
                  value: 3,
                  message: 'Bank name must be at least 3 characters',
                },
              })}
              placeholder="HDFC Bank"
            />
            {errors.bankName && (
              <p className="text-sm text-destructive">{errors.bankName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchName">
              Branch Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="branchName"
              {...register('branchName', {
                required: 'Branch name is required',
                minLength: {
                  value: 3,
                  message: 'Branch name must be at least 3 characters',
                },
              })}
              placeholder="Koramangala Branch"
            />
            {errors.branchName && (
              <p className="text-sm text-destructive">{errors.branchName.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Information Note */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h4 className="font-medium mb-2">Important Notes:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Ensure your name matches your official name as per documents</li>
          <li>Double-check the account number and IFSC code for accuracy</li>
          <li>The account should be active and operational</li>
          <li>Contact HR if you need to update banking details later</li>
        </ul>
      </div>
    </div>
  );
}
