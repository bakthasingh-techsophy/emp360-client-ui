/**
 * Room Booking Form Page - Restructured for Better UX
 * Features: Calendar-first layout, multi-slot selection, recurring meetings
 * URL pattern: /room-booking-form?roomId=room-001&date=2024-12-25
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { Room, RoomBooking, TimeSlot, BookingRecurrence } from './types';
import { mockRooms, mockBookings } from './mockData';
import { BOOKING_PURPOSE_OPTIONS } from './constants';
import {
  generateTimeSlots,
  getRoomCurrentStatus,
  getBlockedDatesInMonth,
} from './utils/availability';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { ImageCarousel } from './components/ImageCarousel';

// Form schema with recurrence and email notifications
const bookingFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  purpose: z.string().min(1, 'Please select a purpose'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  numberOfAttendees: z.number().min(1, 'At least 1 attendee required'),
  
  // Recurrence
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  recurrenceEndDate: z.date().optional(),
  
  // Special requirements
  specialRequests: z.string().optional(),
  
  // Notifications
  notifyAttendees: z.boolean().default(false),
  notificationEmails: z.array(z.string().email()).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine((data) => {
  if (data.recurrence !== 'none' && !data.recurrenceEndDate) {
    return false;
  }
  return true;
}, {
  message: 'Please select an end date for recurring meetings',
  path: ['recurrenceEndDate'],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const initialDate = searchParams.get('date');

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings] = useState<RoomBooking[]>(mockBookings);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);

  // Load room
  useEffect(() => {
    if (roomId) {
      const foundRoom = mockRooms.find((r) => r.id === roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      } else {
        navigate('/room-management/browse');
      }
    } else {
      navigate('/room-management/browse');
    }
  }, [roomId, navigate]);

  // Generate time slots when date changes
  useEffect(() => {
    if (room && selectedDate) {
      const slots = generateTimeSlots(room, selectedDate, bookings, 30);
      setTimeSlots(slots);
      setSelectedSlots([]); // Reset selection when date changes
    }
  }, [room, selectedDate, bookings]);

  // Get blocked dates for calendar
  const blockedDates = useMemo(() => {
    if (!room || !selectedDate) return [];
    return getBlockedDatesInMonth(
      room,
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      bookings
    );
  }, [room, selectedDate, bookings]);

  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      purpose: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      numberOfAttendees: 1,
      recurrence: 'none',
      notifyAttendees: false,
      notificationEmails: [],
    },
  });

  // Watch form values
  const recurrence = form.watch('recurrence');
  const notifyAttendees = form.watch('notifyAttendees');

  // Handle email list
  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!emailList.includes(email)) {
        const newList = [...emailList, email];
        setEmailList(newList);
        form.setValue('notificationEmails', newList);
        setEmailInput('');
      }
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const newList = emailList.filter((e) => e !== emailToRemove);
    setEmailList(newList);
    form.setValue('notificationEmails', newList);
  };

  // Handle multi-slot selection
  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    setSelectedSlots((prev) => {
      const isAlreadySelected = prev.some((s) => s.start === slot.start);
      
      if (isAlreadySelected) {
        // Deselect
        return prev.filter((s) => s.start !== slot.start);
      } else {
        // Select - keep them in order
        const newSlots = [...prev, slot].sort((a, b) => a.start.localeCompare(b.start));
        
        // Check if slots are consecutive
        for (let i = 0; i < newSlots.length - 1; i++) {
          if (newSlots[i].end !== newSlots[i + 1].start) {
            // Not consecutive, replace with new selection
            return [slot];
          }
        }
        
        return newSlots;
      }
    });
  };

  // Update form times when slots change
  useEffect(() => {
    if (selectedSlots.length > 0) {
      const sortedSlots = [...selectedSlots].sort((a, b) => a.start.localeCompare(b.start));
      form.setValue('startTime', sortedSlots[0].start);
      form.setValue('endTime', sortedSlots[sortedSlots.length - 1].end);
    }
  }, [selectedSlots, form]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !room) return;

    const dayOfWeek = date.getDay();
    if (!room.availableDays.includes(dayOfWeek)) {
      return;
    }

    setSelectedDate(date);
    form.setValue('date', date);
  };

  // Handle next step
  const handleNextStep = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }
    setStep('details');
  };

  // Calculate recurring booking instances
  const getRecurringInstances = (
    startDate: Date,
    endDate: Date,
    recurrenceType: BookingRecurrence
  ): Date[] => {
    const instances: Date[] = [startDate];
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      switch (recurrenceType) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        default:
          return instances;
      }
      
      if (currentDate <= endDate) {
        instances.push(new Date(currentDate));
      }
    }
    
    return instances;
  };

  // Handle form submission
  const handleSubmit = async (data: BookingFormValues) => {
    if (!room) return;

    setIsSubmitting(true);
    
    try {
      let bookingInstances = 1;
      
      // Calculate recurring instances
      if (data.recurrence !== 'none' && data.recurrenceEndDate) {
        const instances = getRecurringInstances(
          data.date,
          data.recurrenceEndDate,
          data.recurrence
        );
        bookingInstances = instances.length;
      }
      
      console.log('Booking data:', {
        ...data,
        roomId: room.id,
        roomName: room.name,
        totalInstances: bookingInstances,
        duration: selectedSlots.length * 30,
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      navigate('/room-management/browse?bookingSuccess=true');
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    );
  }

  const currentStatus = getRoomCurrentStatus(room, bookings);
  const totalDuration = selectedSlots.length * 30; // in minutes
  
  // Get available days names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const availableDaysText = room.availableDays.map(day => dayNames[day]).join(', ');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <p className="text-sm text-muted-foreground">{room.location}</p>
            </div>
            <Badge className={currentStatus === 'available' ? 'bg-green-500' : 'bg-yellow-500'}>
              {currentStatus === 'available' ? 'Available' : 'Occupied'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {step === 'select' ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Enhanced Room Info Card */}
            <Card className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Carousel */}
                <div className="lg:col-span-1">
                  {room.images && room.images.length > 0 ? (
                    <ImageCarousel 
                      images={room.images} 
                      alt={room.name}
                      aspectRatio="square"
                    />
                  ) : room.imageUrl ? (
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Room Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                    <p className="text-muted-foreground">{room.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Capacity</p>
                        <p className="font-semibold">{room.capacity} people</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-semibold">{room.floor}</p>
                        {room.building && (
                          <p className="text-xs text-muted-foreground">{room.building}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Available Hours</p>
                        <p className="font-semibold text-sm">
                          {room.availableFrom} - {room.availableTo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Available Days</p>
                        <p className="font-semibold text-sm">{availableDaysText}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(room.amenities)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar - Centered and Structured */}
              <Card className="p-6 lg:col-span-1">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Date
                </h3>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const dayOfWeek = date.getDay();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return !room.availableDays.includes(dayOfWeek) || date < today;
                    }}
                    modifiers={{
                      booked: blockedDates,
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))',
                      },
                    }}
                    className="rounded-md border"
                  />
                </div>
                
                {/* Available Days Info */}
                <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Room Availability</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{availableDaysText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{room.availableFrom} - {room.availableTo}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  <span className="font-medium">Note:</span> Grayed dates have existing bookings
                </p>
              </Card>

              {/* Time Slots - Now on Right/Below */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Select Time Slots
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {selectedDate && format(selectedDate, 'EEEE, MMM d, yyyy')}
                  </div>
                </div>

                {timeSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Room is not available on this day
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Tip:</strong> Click multiple consecutive slots for longer meetings. 
                        Each slot is 30 minutes.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6 max-h-96 overflow-y-auto">
                      {timeSlots.map((slot, index) => {
                        const isSelected = selectedSlots.some((s) => s.start === slot.start);
                        return (
                          <button
                            key={index}
                            onClick={() => handleTimeSlotClick(slot)}
                            disabled={!slot.available}
                            className={`
                              p-3 rounded-lg border text-sm font-medium transition-all relative
                              ${
                                !slot.available
                                  ? 'opacity-40 cursor-not-allowed bg-muted line-through'
                                  : isSelected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                  : 'hover:border-primary hover:bg-primary/5 hover:scale-102'
                              }
                            `}
                            title={
                              !slot.available
                                ? `Booked: ${slot.bookingTitle || 'Unavailable'}`
                                : 'Click to select'
                            }
                          >
                            <div className="flex items-center justify-center gap-1 mb-1">
                              {slot.available ? (
                                isSelected ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : null
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </div>
                            <div className="font-semibold">{slot.start}</div>
                            <div className="text-xs opacity-75">to {slot.end}</div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlots.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Selected Time
                            </p>
                            <p className="text-lg font-semibold">
                              {selectedSlots[0].start} -{' '}
                              {selectedSlots[selectedSlots.length - 1].end}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Duration: {totalDuration} minutes ({selectedSlots.length} slots)
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSlots([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleNextStep}
                      disabled={selectedSlots.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      Continue to Booking Details
                    </Button>
                  </>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Booking Details</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('select')}
                    >
                      ← Change Time
                    </Button>
                  </div>

                  {/* Selected Time Display */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time & Duration</p>
                          <p className="font-medium">
                            {selectedSlots[0]?.start} - {selectedSlots[selectedSlots.length - 1]?.end}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({totalDuration} min)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Meeting Title <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Q4 Planning Meeting"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Purpose <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select purpose" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {BOOKING_PURPOSE_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numberOfAttendees"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Attendees <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={room.capacity}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormDescription>
                                Max: {room.capacity} people
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add agenda or additional details..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Recurring Meeting */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Repeat className="h-5 w-5" />
                        Recurring Meeting
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="recurrence"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Repeat Frequency</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                              >
                                <div>
                                  <RadioGroupItem
                                    value="none"
                                    id="none"
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor="none"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                  >
                                    <span className="text-sm font-medium">No Repeat</span>
                                  </label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="daily"
                                    id="daily"
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor="daily"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                  >
                                    <span className="text-sm font-medium">Daily</span>
                                  </label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="weekly"
                                    id="weekly"
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor="weekly"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                  >
                                    <span className="text-sm font-medium">Weekly</span>
                                  </label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="monthly"
                                    id="monthly"
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor="monthly"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                  >
                                    <span className="text-sm font-medium">Monthly</span>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {recurrence !== 'none' && (
                        <FormField
                          control={form.control}
                          name="recurrenceEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date <span className="text-destructive">*</span></FormLabel>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                className="rounded-md border w-fit"
                              />
                              <FormDescription>
                                Select when recurring meetings should end
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Separator />

                    {/* Special Requests */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Special Requests</h3>

                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any special requests such as catering, room setup, equipment needs, external guests, etc..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include details about catering, setup requirements, equipment, external guests, or any other needs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Notifications</h3>
                      
                      <FormField
                        control={form.control}
                        name="notifyAttendees"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1">
                              <FormLabel>Send Email Notifications</FormLabel>
                              <FormDescription>
                                Send booking confirmation to additional email addresses (booker will be notified automatically)
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {notifyAttendees && (
                        <div className="pl-10 space-y-3">
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddEmail();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleAddEmail}
                              variant="secondary"
                            >
                              Add
                            </Button>
                          </div>

                          {emailList.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Email Recipients ({emailList.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {emailList.map((email, index) => (
                                  <Badge key={index} variant="secondary" className="pl-3 pr-1">
                                    {email}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEmail(email)}
                                      className="ml-2 hover:bg-muted rounded-full p-0.5"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <FormActionBar
                  onCancel={() => navigate('/room-management/browse')}
                  isSubmitting={isSubmitting}
                  submitText="Confirm Booking"
                />
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
