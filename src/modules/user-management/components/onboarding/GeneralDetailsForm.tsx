/**
 * General Details Form
 * Personal information, addresses, and emergency contacts
 */

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { GeneralDetails, EmergencyContact, Gender, MaritalStatus } from '../../types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable/EditableItemsTable';

interface GeneralDetailsFormProps {
  form: UseFormReturn<GeneralDetails>;
  employeeId?: string;
}

export function GeneralDetailsFormComponent({ form, employeeId }: GeneralDetailsFormProps) {
  const { getGeneralDetailsById } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);

  const fetchGeneralDetails = async () => {
    if (employeeId) {
      setIsLoading(true);
      const data = await getGeneralDetailsById(employeeId);
      if (data) {
        form.reset({
          id: data.id || employeeId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          secondaryPhone: data.secondaryPhone || '',
          gender: data.gender || Gender.MALE,
          bloodGroup: data.bloodGroup || '',
          panNumber: data.panNumber || '',
          aadharNumber: data.aadharNumber || '',
          contactAddress: data.contactAddress || '',
          permanentAddress: data.permanentAddress || '',
          sameAsContactAddress: data.sameAsContactAddress || false,
          emergencyContacts: data.emergencyContacts || [],
          personalEmail: data.personalEmail || '',
          nationality: data.nationality || '',
          physicallyChallenged: data.physicallyChallenged || false,
          passportNumber: data.passportNumber || '',
          passportExpiry: data.passportExpiry || '',
          maritalStatus: data.maritalStatus || MaritalStatus.SINGLE,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        });
      }
      setIsLoading(false);
    }
  };

  // Fetch general details when employeeId is available
  useEffect(() => {
    fetchGeneralDetails();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading general details...</p>
        </div>
      </div>
    );
  }

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const sameAsContactAddress = watch('sameAsContactAddress');
  const contactAddress = watch('contactAddress');
  const emergencyContacts = watch('emergencyContacts') || [];

  // Handle same as contact address checkbox
  const handleSameAddressChange = (checked: boolean) => {
    setValue('sameAsContactAddress', checked);
    if (checked && contactAddress) {
      setValue('permanentAddress', contactAddress);
    }
  };

  // Emergency contacts table configuration
  const emergencyContactColumns: TableColumn<EmergencyContact>[] = [
    {
      key: 'name',
      header: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Contact name',
      flex: 2,
    },
    {
      key: 'relation',
      header: 'Relation',
      type: 'text',
      required: true,
      placeholder: 'e.g., Spouse, Parent',
      flex: 1,
    },
    {
      key: 'phone',
      header: 'Phone',
      type: 'text',
      required: true,
      placeholder: '9876543210',
      flex: 1,
    },
  ];

  const emptyEmergencyContact: EmergencyContact = {
    id: '',
    name: '',
    relation: '',
    phone: '',
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-general">
              Official Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email-general"
              type="email"
              {...register('email', {
                required: 'Official email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="employee@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail">Personal Email</Label>
            <Input
              id="personalEmail"
              type="email"
              {...register('personalEmail', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="personal@gmail.com"
            />
            {errors.personalEmail && (
              <p className="text-sm text-destructive">{errors.personalEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-general">
              Primary Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone-general"
              {...register('phone', {
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Enter a valid 10-digit phone number',
                },
              })}
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryPhone-general">Secondary Phone</Label>
            <Input
              id="secondaryPhone-general"
              {...register('secondaryPhone', {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Enter a valid 10-digit phone number',
                },
              })}
              placeholder="9876543210"
            />
            {errors.secondaryPhone && (
              <p className="text-sm text-destructive">{errors.secondaryPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Gender <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={watch('gender')}
              onValueChange={(value) => setValue('gender', value as Gender)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.MALE} id="male" />
                  <Label htmlFor="male" className="font-normal cursor-pointer">
                    Male
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.FEMALE} id="female" />
                  <Label htmlFor="female" className="font-normal cursor-pointer">
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.OTHER} id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer">
                    Other
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>
              Blood Group <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('bloodGroup')}
              onValueChange={(value) => setValue('bloodGroup', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Marital Status <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={watch('maritalStatus')}
              onValueChange={(value) => setValue('maritalStatus', value as MaritalStatus)}
            >
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MaritalStatus.SINGLE} id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">
                    Single
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MaritalStatus.MARRIED} id="married" />
                  <Label htmlFor="married" className="font-normal cursor-pointer">
                    Married
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MaritalStatus.DIVORCED} id="divorced" />
                  <Label htmlFor="divorced" className="font-normal cursor-pointer">
                    Divorced
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MaritalStatus.WIDOWED} id="widowed" />
                  <Label htmlFor="widowed" className="font-normal cursor-pointer">
                    Widowed
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              {...register('nationality')}
              placeholder="Indian"
            />
          </div>

          <div className="space-y-2 flex items-center pt-8">
            <Checkbox
              id="physicallyChallenged"
              checked={watch('physicallyChallenged')}
              onCheckedChange={(checked) => setValue('physicallyChallenged', !!checked)}
            />
            <Label
              htmlFor="physicallyChallenged"
              className="ml-2 font-normal cursor-pointer"
            >
              Physically Challenged
            </Label>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactAddress">
              Contact Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="contactAddress"
              {...register('contactAddress', {
                required: 'Contact address is required',
              })}
              placeholder="Enter your current residential address"
              rows={3}
            />
            {errors.contactAddress && (
              <p className="text-sm text-destructive">{errors.contactAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="permanentAddress">
              Permanent Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="permanentAddress"
              {...register('permanentAddress', {
                required: 'Permanent address is required',
              })}
              placeholder="Enter your permanent address"
              rows={3}
              disabled={sameAsContactAddress}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="sameAsContactAddress"
                checked={sameAsContactAddress}
                onCheckedChange={handleSameAddressChange}
              />
              <Label
                htmlFor="sameAsContactAddress"
                className="text-sm font-normal cursor-pointer"
              >
                Same as Contact Address
              </Label>
            </div>
            {errors.permanentAddress && (
              <p className="text-sm text-destructive">
                {errors.permanentAddress.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Identity Documents */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="panNumber">
              PAN Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="panNumber"
              {...register('panNumber', {
                required: 'PAN number is required',
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: 'Enter a valid PAN (e.g., ABCDE1234F)',
                },
              })}
              placeholder="ABCDE1234F"
              className="uppercase"
            />
            {errors.panNumber && (
              <p className="text-sm text-destructive">{errors.panNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharNumber">
              Aadhar Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="aadharNumber"
              {...register('aadharNumber', {
                required: 'Aadhar number is required',
                pattern: {
                  value: /^[0-9]{12}$/,
                  message: 'Enter a valid 12-digit Aadhar number',
                },
              })}
              placeholder="123456789012"
            />
            {errors.aadharNumber && (
              <p className="text-sm text-destructive">{errors.aadharNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportNumber">Passport Number</Label>
            <Input
              id="passportNumber"
              {...register('passportNumber', {
                pattern: {
                  value: /^[A-Z]{1}[0-9]{7}$/,
                  message: 'Enter a valid passport number (e.g., A1234567)',
                },
              })}
              placeholder="A1234567"
              className="uppercase"
            />
            {errors.passportNumber && (
              <p className="text-sm text-destructive">{errors.passportNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportExpiry">Passport Expiry</Label>
            <DatePicker
              date={watch('passportExpiry') ? new Date(watch('passportExpiry')) : undefined}
              onSelect={(date) => setValue('passportExpiry', date?.toISOString() || '')}
              placeholder="Select passport expiry date"
            />
            {errors.passportExpiry && (
              <p className="text-sm text-destructive">{errors.passportExpiry.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add at least one emergency contact who can be reached in case of emergencies
        </p>
        <EditableItemsTable
          columns={emergencyContactColumns}
          items={emergencyContacts}
          onChange={(items) => setValue('emergencyContacts', items)}
          emptyItemTemplate={emptyEmergencyContact}
          minItems={1}
          maxItems={5}
        />
      </div>
    </div>
  );
}
