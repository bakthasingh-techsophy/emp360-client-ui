/**
 * Room Browse Page
 * Browse and search for available rooms to book
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { RoomCard } from './components/RoomCard';
import { RoomDetailsModal } from './components/RoomDetailsModal';
import { Room } from './types';
import { mockRooms, mockBookings } from './mockData';
import { Building2, ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export function RoomBrowse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [rooms] = useState<Room[]>(mockRooms);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Show success message if redirected from booking
  useEffect(() => {
    if (searchParams.get('bookingSuccess') === 'true') {
      toast({
        title: 'Booking Successful',
        description: 'Your room has been booked successfully!',
        variant: 'default',
      });
      // Clear the query param
      navigate('/room-management/browse', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string | ReactNode;
    action: () => void;
    variant?: 'default' | 'destructive';
    confirmText?: string;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  // Mock user role - in real app, get from auth context
  const isAdmin = true;

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          r.type.toLowerCase().includes(query)
      );
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.id) {
        case 'status':
          filtered = filtered.filter((r) => r.status === filter.value);
          break;
        case 'type':
          filtered = filtered.filter((r) => r.type === filter.value);
          break;
        case 'capacity':
          if (filter.value?.from) {
            filtered = filtered.filter((r) => r.capacity >= filter.value.from);
          }
          if (filter.value?.to) {
            filtered = filtered.filter((r) => r.capacity <= filter.value.to);
          }
          break;
        case 'floor':
          filtered = filtered.filter((r) => r.floor === filter.value);
          break;
        case 'building':
          filtered = filtered.filter((r) => r.building === filter.value);
          break;
        case 'hasVideoConference':
          filtered = filtered.filter((r) => r.amenities.videoConference === (filter.value === 'true'));
          break;
        case 'hasProjector':
          filtered = filtered.filter((r) => r.amenities.projector === (filter.value === 'true'));
          break;
      }
    });

    return filtered;
  }, [rooms, searchQuery, activeFilters]);

  // Handlers
  const handleAddRoom = () => {
    navigate('/room-management/room-form?mode=create');
  };

  const handleEditRoom = (room: Room) => {
    navigate(`/room-management/room-form?mode=edit&id=${room.id}`);
  };

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setDetailsModalOpen(true);
  };

  const handleBook = (room: Room) => {
    // Navigate to booking page with room ID
    navigate(`/room-management/booking-form?roomId=${room.id}`);
  };

  const handleDelete = (room: Room) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Room',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{room.name}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All bookings associated with this room will be affected.
          </p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: () => {
        console.log('Delete room:', room.id);
        // API call here
      },
    });
  };

  // Get unique values for filter options
  const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort();
  const uniqueBuildings = Array.from(new Set(rooms.map((r) => r.building).filter(Boolean))).sort();

  // Filter configuration for GenericToolbar
  const filterConfig = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'available', label: 'Available' },
        { value: 'occupied', label: 'Occupied' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      id: 'type',
      label: 'Room Type',
      type: 'select' as const,
      options: [
        { value: 'conference', label: 'Conference Room' },
        { value: 'meeting', label: 'Meeting Room' },
        { value: 'huddle', label: 'Huddle Room' },
        { value: 'training', label: 'Training Room' },
        { value: 'boardroom', label: 'Boardroom' },
        { value: 'event', label: 'Event Space' },
      ],
    },
    {
      id: 'floor',
      label: 'Floor',
      type: 'select' as const,
      options: uniqueFloors.map((floor) => ({ value: floor, label: floor })),
    },
    {
      id: 'building',
      label: 'Building',
      type: 'select' as const,
      options: uniqueBuildings.map((building) => ({ value: building || '', label: building || '' })),
    },
    {
      id: 'hasVideoConference',
      label: 'Video Conference',
      type: 'boolean' as const,
    },
    {
      id: 'hasProjector',
      label: 'Projector',
      type: 'boolean' as const,
    },
  ];

  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Header with Back Button */}
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/room-management')}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Browse Rooms
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse available rooms and make bookings
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search rooms by name, location, or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={false}
            showConfigureView={false}
            showAddButton={isAdmin}
            addButtonLabel="Add Room"
            onAdd={handleAddRoom}
          />

          {/* Room Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading rooms...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || activeFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first room'}
              </p>
              {isAdmin && !searchQuery && activeFilters.length === 0 && (
                <button
                  onClick={handleAddRoom}
                  className="text-primary hover:underline"
                >
                  Add your first room
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  bookings={mockBookings}
                  onBook={handleBook}
                  onView={handleView}
                  onEdit={isAdmin ? handleEditRoom : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </PageLayout>

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={selectedRoom}
        bookings={mockBookings}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />
    </>
  );
}

