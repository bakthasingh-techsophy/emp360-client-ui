/**
 * Room Booking Main Page
 * Comprehensive room management system with multi-company support
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { RoomStatsCards } from './components/RoomStatsCards';
import { RoomCard } from './components/RoomCard';
import { Room, RoomStats } from './types';
import { mockRooms, mockBookings } from './mockData';
import { Building2 } from 'lucide-react';
import { ReactNode } from 'react';

export function RoomBooking() {
  const navigate = useNavigate();

  // State
  const [rooms] = useState<Room[]>(mockRooms);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

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

  // Calculate stats
  const stats: RoomStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = mockBookings.filter((b) => b.date === today && b.status === 'confirmed');
    
    return {
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => r.status === 'available').length,
      occupiedRooms: rooms.filter((r) => r.status === 'occupied').length,
      totalBookingsToday: todayBookings.length,
      upcomingBookings: mockBookings.filter((b) => b.status === 'confirmed').length,
      averageUtilization: Math.round(
        rooms.reduce((sum, r) => sum + (r.utilizationRate || 0), 0) / rooms.length
      ),
    };
  }, [rooms]);

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
    navigate('/room-form?mode=create');
  };

  const handleEdit = (room: Room) => {
    navigate(`/room-form?mode=edit&id=${room.id}`);
  };

  const handleView = (room: Room) => {
    // Navigate to room details/booking page
    console.log('View room:', room.id);
    // TODO: Implement room details view with booking calendar
  };

  const handleBook = (room: Room) => {
    // Navigate to booking form
    console.log('Book room:', room.id);
    // TODO: Implement booking form
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
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Room Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage meeting rooms, view bookings, and collaborate across companies
            </p>
          </div>

          {/* Stats Cards */}
          <RoomStatsCards stats={stats} />

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
                  onBook={handleBook}
                  onView={handleView}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </PageLayout>

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

