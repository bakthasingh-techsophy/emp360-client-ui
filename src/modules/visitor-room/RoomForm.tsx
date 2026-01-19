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
import { Badge } from '@/components/ui/badge';
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
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { Room } from './types';
import { mockRooms } from './mockData';
import { ROOM_TYPE_LABELS, DAY_LABELS, AMENITY_LABELS, DEFAULT_AVAILABILITY, DEFAULT_AMENITIES } from './constants';

interface RoomFormProps {
  availableAmenities?: string[]; // Configurable amenities from admin settings
}

// Form validation schema
const roomFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['conference', 'meeting', 'huddle', 'training', 'boardroom', 'event']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  floor: z.string().min(1, 'Floor is required'),
  building: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  
  // Amenities (dynamic)
  amenities: z.record(z.boolean()).default({}),
  
  // Availability
  availableFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  availableTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  availableDays: z.array(z.number()).min(1, 'Select at least one day'),
  
  // Images
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageUploadType: z.enum(['url', 'upload']).default('url'),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export function RoomForm({ availableAmenities = DEFAULT_AMENITIES }: RoomFormProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'create' | 'edit') || 'create';
  const roomId = searchParams.get('id');

  const [room, setRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadType, setImageUploadType] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize amenities default values
  const getInitialAmenities = () => {
    const amenities: Record<string, boolean> = {};
    availableAmenities.forEach((amenity) => {
      amenities[amenity] = false;
    });
    // Set wifi and airConditioning to true by default
    if (amenities.wifi !== undefined) amenities.wifi = true;
    if (amenities.airConditioning !== undefined) amenities.airConditioning = true;
    return amenities;
  };

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
      amenities: getInitialAmenities(),
      availableFrom: DEFAULT_AVAILABILITY.availableFrom,
      availableTo: DEFAULT_AVAILABILITY.availableTo,
      availableDays: DEFAULT_AVAILABILITY.availableDays,
      imageUrl: '',
      imageUploadType: 'url',
    },
  });

  // Load room data for edit mode
  useEffect(() => {
    if (mode === 'edit' && roomId) {
      const foundRoom = mockRooms.find((r) => r.id === roomId);
      if (foundRoom) {
        setRoom(foundRoom);
        
        // Convert room amenities to form format
        const amenitiesFormData: Record<string, boolean> = {};
        availableAmenities.forEach((amenity) => {
          amenitiesFormData[amenity] = foundRoom.amenities[amenity as keyof typeof foundRoom.amenities] || false;
        });
        
        // Populate form with room data
        form.reset({
          name: foundRoom.name,
          description: foundRoom.description || '',
          type: foundRoom.type,
          capacity: foundRoom.capacity,
          floor: foundRoom.floor,
          building: foundRoom.building || '',
          location: foundRoom.location,
          amenities: amenitiesFormData,
          availableFrom: foundRoom.availableFrom,
          availableTo: foundRoom.availableTo,
          availableDays: foundRoom.availableDays,
          imageUrl: foundRoom.imageUrl || '',
          imageUploadType: 'url',
        });
      }
    }
  }, [mode, roomId, form, availableAmenities]);

  // Handlers
  const handleSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting room:', data);
      
      // Handle image upload if file is selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        // TODO: Implement file upload to server
        // const uploadedUrl = await uploadImage(selectedFile);
        // data.imageUrl = uploadedUrl;
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate back to room list
      navigate('/room-management/browse');
    } catch (error) {
      console.error('Error submitting room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/room-management/browse');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', previewUrl);
    }
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
            <FormDescription className="text-xs mb-3">
              Available amenities are configured by the administrator
            </FormDescription>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <FormField
                  key={amenity}
                  control={form.control}
                  name={`amenities.${amenity}` as any}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-normal cursor-pointer">
                        {AMENITY_LABELS[amenity] || amenity}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
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
            </div>
          </Card>

          {/* Room Image */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Room Image (Optional)</h3>
            
            {/* Image Upload Type Selection */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={imageUploadType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageUploadType('url')}
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Image URL
              </Button>
              <Button
                type="button"
                variant={imageUploadType === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageUploadType('upload')}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
            </div>

            {imageUploadType === 'url' ? (
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
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-2 block">Upload Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{selectedFile.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
                
                {form.watch('imageUrl') && imageUploadType === 'upload' && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Preview:</p>
                    <img
                      src={form.watch('imageUrl')}
                      alt="Preview"
                      className="max-w-xs h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}
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
