/**
 * Visitor Registration Form Component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FormActionBar } from '@/components/common/FormActionBar';
import { VisitorFormData } from '../types';
import { PURPOSE_OPTIONS, ID_TYPE_OPTIONS } from '../constants';
import { mockEmployees, mockVisitors } from '../mockData';

interface VisitorRegistrationFormProps {
  mode: 'create' | 'edit';
  visitorId?: string;
}

export function VisitorRegistrationForm({ mode, visitorId }: VisitorRegistrationFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VisitorFormData>({
    defaultValues: {
      registrationType: 'pre-registered',
      escortRequired: false,
    },
  });

  const selectedHostId = watch('hostEmployeeId');
  const registrationType = watch('registrationType');

  // Load visitor data in edit mode
  useEffect(() => {
    if (mode === 'edit' && visitorId) {
      const foundVisitor = mockVisitors.find((v) => v.id === visitorId);
      if (foundVisitor) {
        // Populate form with visitor data
        setValue('name', foundVisitor.name);
        setValue('email', foundVisitor.email);
        setValue('phone', foundVisitor.phone);
        setValue('company', foundVisitor.company || '');
        setValue('idType', foundVisitor.idType);
        setValue('idNumber', foundVisitor.idNumber || '');
        setValue('purpose', foundVisitor.purpose);
        setValue('purposeDetails', foundVisitor.purposeDetails || '');
        setValue('hostEmployeeId', foundVisitor.hostEmployeeId);
        setValue('expectedArrivalDate', foundVisitor.expectedArrivalDate);
        setValue('expectedArrivalTime', foundVisitor.expectedArrivalTime);
        setValue('expectedDepartureTime', foundVisitor.expectedDepartureTime || '');
        setValue('registrationType', foundVisitor.registrationType);
        setValue('notes', foundVisitor.notes || '');
        setValue('vehicleNumber', foundVisitor.vehicleNumber || '');
        setValue('escortRequired', foundVisitor.escortRequired || false);
      }
    }
  }, [mode, visitorId, setValue]);

  const onSubmit = async (data: VisitorFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Form data:', data);
    
    setIsSubmitting(false);
    
    // Navigate back to visitor management
    navigate('/visitor-management');
  };

  const handleCancel = () => {
    navigate('/visitor-management');
  };

  const selectedEmployee = mockEmployees.find((emp) => emp.id === selectedHostId);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Visitor' : 'Register New Visitor'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit' 
              ? 'Update visitor information and visit details' 
              : 'Fill in the visitor details to register a new visit'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Registration Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Registration Type</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="registrationType">Type <span className="text-destructive">*</span></Label>
              <Select
                value={registrationType}
                onValueChange={(value: any) => setValue('registrationType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-registered">Pre-registered</SelectItem>
                  <SelectItem value="instant">Instant Check-in</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {registrationType === 'pre-registered' 
                  ? 'Visitor details registered in advance, awaiting approval' 
                  : 'Visitor arrived without prior registration, needs immediate approval'}
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+1-555-0123"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Company / Organization</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Company name"
              />
            </div>

            <div>
              <Label htmlFor="idType">ID Type</Label>
              <Select onValueChange={(value: any) => setValue('idType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                {...register('idNumber')}
                placeholder="ID number"
              />
            </div>
          </div>
        </Card>

        {/* Visit Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Visit Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="purpose">Purpose of Visit <span className="text-destructive">*</span></Label>
              <Select onValueChange={(value: any) => setValue('purpose', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-destructive mt-1">{errors.purpose.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hostEmployeeId">Host Employee <span className="text-destructive">*</span></Label>
              <Select onValueChange={(value) => setValue('hostEmployeeId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select host employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEmployee && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedEmployee.email}
                </p>
              )}
              {errors.hostEmployeeId && (
                <p className="text-sm text-destructive mt-1">{errors.hostEmployeeId.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="purposeDetails">Visit Details</Label>
              <Textarea
                id="purposeDetails"
                {...register('purposeDetails')}
                placeholder="Provide additional details about the visit..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Visit Schedule</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="expectedArrivalDate">Expected Arrival Date <span className="text-destructive">*</span></Label>
              <Input
                id="expectedArrivalDate"
                type="date"
                {...register('expectedArrivalDate', { required: 'Date is required' })}
              />
              {errors.expectedArrivalDate && (
                <p className="text-sm text-destructive mt-1">{errors.expectedArrivalDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expectedArrivalTime">Expected Arrival Time <span className="text-destructive">*</span></Label>
              <Input
                id="expectedArrivalTime"
                type="time"
                {...register('expectedArrivalTime', { required: 'Time is required' })}
              />
              {errors.expectedArrivalTime && (
                <p className="text-sm text-destructive mt-1">{errors.expectedArrivalTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expectedDepartureTime">Expected Departure Time</Label>
              <Input
                id="expectedDepartureTime"
                type="time"
                {...register('expectedDepartureTime')}
              />
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  {...register('vehicleNumber')}
                  placeholder="e.g., ABC-1234"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="escortRequired"
                  onCheckedChange={(checked) => setValue('escortRequired', !!checked)}
                />
                <Label htmlFor="escortRequired" className="cursor-pointer">
                  Escort Required
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional notes or special requirements..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Form Action Bar */}
        <FormActionBar
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          submitText={mode === 'edit' ? 'Update Visitor' : 'Register Visitor'}
        />
      </form>
    </div>
  );
}
