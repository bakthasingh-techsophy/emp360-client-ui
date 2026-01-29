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

import { UseFormReturn } from 'react-hook-form';
import { BankingDetailsForm } from '../../types/onboarding.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BankingDetailsFormProps {
  form: UseFormReturn<BankingDetailsForm>;
}

export function BankingDetailsFormComponent({ form }: BankingDetailsFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Banking Information */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Provide your bank account information for salary deposits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">
              Account Holder Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountHolderName"
              {...register('accountHolderName', {
                required: 'Account holder name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters',
                },
              })}
              placeholder="John Doe"
            />
            {errors.accountHolderName && (
              <p className="text-sm text-destructive">
                {errors.accountHolderName.message}
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
          <li>Ensure the account holder name matches your official name</li>
          <li>Double-check the account number and IFSC code for accuracy</li>
          <li>The account should be active and operational</li>
          <li>Contact HR if you need to update banking details later</li>
        </ul>
      </div>
    </div>
  );
}
