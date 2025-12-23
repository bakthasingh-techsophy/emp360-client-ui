/**
 * Room Form Page - Create/Edit Room
 * Follows the same pattern as Visitor Form and Policy Form
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormActionBar } from '@/components/common/FormActionBar';
import { ArrowLeft } from 'lucide-react';
import { Room } from './types';
import { mockRooms, mockCompanies } from './mockData';
import { ROOM_TYPE_LABELS, DAY_LABELS, AMENITY_LABELS, DEFAULT_AVAILABILITY } from './constants';

// Form validation schema
const roomFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['conference', 'meeting', 'huddle', 'training', 'boardroom', 'event']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  floor: z.string().min(1, 'Floor is required'),
  building: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  
  // Amenities
  projector: z.boolean().default(false),
  whiteboard: z.boolean().default(false),
  videoConference: z.boolean().default(false),
  audioSystem: z.boolean().default(false),
  wifi: z.boolean().default(false),
  television: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
  phoneConference: z.boolean().default(false),
  smartBoard: z.boolean().default(false),
  refreshments: z.boolean().default(false),
  
  // Sharing
  sharedWithCompanies: z.array(z.string()).default([]),
  
  // Pricing
  hourlyRate: z.number().min(0).optional(),
  halfDayRate: z.number().min(0).optional(),
  fullDayRate: z.number().min(0).optional(),
  
  // Availability
  availableFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  availableTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  availableDays: z.array(z.number()).min(1, 'Select at least one day'),
  minBookingDuration: z.number().min(15, 'Minimum booking must be at least 15 minutes'),
  maxBookingDuration: z.number().min(30, 'Maximum booking must be at least 30 minutes'),
  bufferTime: z.number().min(0, 'Buffer time cannot be negative'),
  
  // Images
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export function RoomForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'create' | 'edit') || 'create';
  const roomId = searchParams.get('id');

  const [room, setRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available companies for sharing (exclude owner company)
  const currentCompanyId = 'comp-001'; // In real app, get from auth context
  const availableCompanies = mockCompanies.filter((c) => c.id !== currentCompanyId);

  // Form setup
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'meeting',
      capacity: 10,
      floor: '',
      building: '',
      location: '',
      projector: false,
      whiteboard: false,
      videoConference: false,
      audioSystem: false,
      wifi: true,
      television: false,
      airConditioning: true,
      phoneConference: false,
      smartBoard: false,
      refreshments: false,
      sharedWithCompanies: [],
      hourlyRate: undefined,
      halfDayRate: undefined,
      fullDayRate: undefined,
      availableFrom: DEFAULT_AVAILABILITY.availableFrom,
      availableTo: DEFAULT_AVAILABILITY.availableTo,
      availableDays: DEFAULT_AVAILABILITY.availableDays,
      minBookingDuration: DEFAULT_AVAILABILITY.minBookingDuration,
      maxBookingDuration: DEFAULT_AVAILABILITY.maxBookingDuration,
      bufferTime: DEFAULT_AVAILABILITY.bufferTime,
      imageUrl: '',
    },
  });

  // Load room data for edit mode
  useEffect(() => {
    if (mode === 'edit' && roomId) {
      const foundRoom = mockRooms.find((r) => r.id === roomId);
      if (foundRoom) {
        setRoom(foundRoom);
        
        // Populate form with room data
        form.reset({
          name: foundRoom.name,
          description: foundRoom.description || '',
          type: foundRoom.type,
          capacity: foundRoom.capacity,
          floor: foundRoom.floor,
          building: foundRoom.building || '',
          location: foundRoom.location,
          projector: foundRoom.amenities.projector || false,
          whiteboard: foundRoom.amenities.whiteboard || false,
          videoConference: foundRoom.amenities.videoConference || false,
          audioSystem: foundRoom.amenities.audioSystem || false,
          wifi: foundRoom.amenities.wifi || false,
          television: foundRoom.amenities.television || false,
          airConditioning: foundRoom.amenities.airConditioning || false,
          phoneConference: foundRoom.amenities.phoneConference || false,
          smartBoard: foundRoom.amenities.smartBoard || false,
          refreshments: foundRoom.amenities.refreshments || false,
          sharedWithCompanies: foundRoom.sharedWithCompanies,
          hourlyRate: foundRoom.hourlyRate,
          halfDayRate: foundRoom.halfDayRate,
          fullDayRate: foundRoom.fullDayRate,
          availableFrom: foundRoom.availableFrom,
          availableTo: foundRoom.availableTo,
          availableDays: foundRoom.availableDays,
          minBookingDuration: foundRoom.minBookingDuration,
          maxBookingDuration: foundRoom.maxBookingDuration,
          bufferTime: foundRoom.bufferTime,
          imageUrl: foundRoom.imageUrl || '',
        });
      }
    }
  }, [mode, roomId, form]);

  // Handlers
  const handleSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting room:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate back to room list
      navigate('/room-management');
    } catch (error) {
      console.error('Error submitting room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/room-management');
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Room' : 'Add New Room'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === 'edit' ? `Update: ${room?.name || ''}` : 'Create a new meeting room'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-24">
          
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs">
                      Room Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Innovation Hub, Conference Room A"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the room..."
                        className="text-sm min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Room Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Room Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-sm">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Capacity <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max number of people"
                        className="text-sm"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Location Details */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Floor */}
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Floor <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 5th Floor, Ground Floor"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Building */}
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Building</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Building A, Main Block"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Full Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs">
                      Full Location <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Complete location description"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      e.g., "5th Floor, Building A, West Wing"
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Amenities</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as any}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-normal cursor-pointer">
                        {label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </Card>

          {/* Sharing & Collaboration */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Sharing & Collaboration</h3>
            
            <FormField
              control={form.control}
              name="sharedWithCompanies"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs">Share with Companies</FormLabel>
                  <FormDescription className="text-xs mb-2">
                    Allow other companies in your network to book this room
                  </FormDescription>
                  <div className="space-y-2">
                    {availableCompanies.map((company) => (
                      <FormField
                        key={company.id}
                        control={form.control}
                        name="sharedWithCompanies"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(company.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, company.id])
                                    : field.onChange(
                                        field.value?.filter((id) => id !== company.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-normal cursor-pointer">
                              {company.name}
                              {company.subscriptionType === 'shared' && (
                                <span className="text-muted-foreground ml-1">
                                  (Shared subscription)
                                </span>
                              )}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </Card>

          {/* Pricing (Optional) */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Pricing (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="text-sm"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="halfDayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Half-Day Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="text-sm"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullDayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Full-Day Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="text-sm"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Availability Settings */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Availability Settings</h3>
            
            <div className="space-y-4">
              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Available From <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availableTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Available To <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Available Days */}
              <FormField
                control={form.control}
                name="availableDays"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Available Days <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAY_LABELS.map((day, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name="availableDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div>
                                  <Checkbox
                                    id={`day-${index}`}
                                    checked={field.value?.includes(index)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, index])
                                        : field.onChange(
                                            field.value?.filter((d) => d !== index)
                                          );
                                    }}
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor={`day-${index}`}
                                    className="flex items-center justify-center px-3 py-2 text-xs font-medium border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-accent"
                                  >
                                    {day.slice(0, 3)}
                                  </label>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Booking Duration Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="minBookingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Min. Booking (minutes) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          className="text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxBookingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Max. Booking (minutes) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="480"
                          className="text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bufferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Buffer Time (minutes) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          className="text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Time between bookings for setup/cleaning
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Room Image */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Room Image (Optional)</h3>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Provide a URL to an image of the room
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </Card>

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitText={mode === 'edit' ? 'Update Room' : 'Create Room'}
          />
        </form>
      </Form>
    </div>
  );
}
