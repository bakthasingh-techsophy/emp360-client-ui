/**
 * Room Management Admin Dashboard
 */

import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Eye, CheckCircle, XCircle, Calendar
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { mockBookings, mockRooms } from './mockData';
import { format, isToday, isFuture, parseISO } from 'date-fns';

// Booking interface
interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  bookedByName: string;
  bookedByEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

// Mock bookings data
const mockAdminBookings: Booking[] = [
  {
    id: 'booking-001',
    roomId: 'room-001',
    roomName: 'Innovation Hub',
    bookedByName: 'John Admin',
    bookedByEmail: 'john.admin@techcorp.com',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    purpose: 'Team Meeting',
    attendees: 8,
    status: 'confirmed',
    recurrence: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'booking-002',
    roomId: 'room-001',
    roomName: 'Innovation Hub',
    bookedByName: 'Sarah Designer',
    bookedByEmail: 'sarah@designhub.com',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    purpose: 'Presentation',
    attendees: 15,
    status: 'pending',
    recurrence: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'booking-003',
    roomId: 'room-002',
    roomName: 'Creative Studio',
    bookedByName: 'Mike Johnson',
    bookedByEmail: 'mike@techcorp.com',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'Client Meeting',
    attendees: 6,
    status: 'confirmed',
    recurrence: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'booking-004',
    roomId: 'room-003',
    roomName: 'Executive Suite',
    bookedByName: 'Emily Brown',
    bookedByEmail: 'emily@techcorp.com',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Board Meeting',
    attendees: 10,
    status: 'pending',
    recurrence: 'weekly',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const RECURRENCE_LABELS = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function RoomManagementAdmin() {
  const navigate = useNavigate();

  // State
  const [bookings] = useState<Booking[]>(mockAdminBookings);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Separate state for each tab
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingFilters, setPendingFilters] = useState<any[]>([]);
  const [pendingColumns, setPendingColumns] = useState<string[]>([
    'roomName', 'bookedByName', 'date', 'time', 'purpose', 'attendees', 'status', 'actions'
  ]);
  const [pendingPageIndex, setPendingPageIndex] = useState(0);
  const [pendingPageSize, setPendingPageSize] = useState(10);

  const [todaySearch, setTodaySearch] = useState('');
  const [todayFilters, setTodayFilters] = useState<any[]>([]);
  const [todayColumns, setTodayColumns] = useState<string[]>([
    'roomName', 'bookedByName', 'time', 'purpose', 'attendees', 'status', 'actions'
  ]);
  const [todayPageIndex, setTodayPageIndex] = useState(0);
  const [todayPageSize, setTodayPageSize] = useState(10);

  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [upcomingFilters, setUpcomingFilters] = useState<any[]>([]);
  const [upcomingColumns, setUpcomingColumns] = useState<string[]>([
    'roomName', 'bookedByName', 'date', 'time', 'purpose', 'attendees', 'status', 'actions'
  ]);
  const [upcomingPageIndex, setUpcomingPageIndex] = useState(0);
  const [upcomingPageSize, setUpcomingPageSize] = useState(10);

  const [allSearch, setAllSearch] = useState('');
  const [allFilters, setAllFilters] = useState<any[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([
    'roomName', 'bookedByName', 'date', 'time', 'purpose', 'attendees', 'recurrence', 'status', 'actions'
  ]);
  const [allPageIndex, setAllPageIndex] = useState(0);
  const [allPageSize, setAllPageSize] = useState(10);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Custom toolbar actions
  const toolbarActions = [
    {
      id: 'browse-rooms',
      label: 'Browse Rooms',
      onClick: () => navigate('/room-management/browse'),
      variant: 'default' as const,
    },
  ];

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

  // Stats calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalRooms = mockRooms.length;
    const availableRooms = mockRooms.filter(r => r.status === 'available').length;
    const todayBookings = bookings.filter(b => b.date === today).length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalBookings = bookings.length;
    const utilization = totalRooms > 0 ? Math.round((todayBookings / totalRooms) * 100) : 0;

    return {
      totalRooms,
      availableRooms,
      todayBookings,
      pendingBookings,
      totalBookings,
      utilization,
    };
  }, [bookings]);

  // Filter bookings by tab
  const pendingBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'pending');
  }, [bookings]);

  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date === today);
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date > today);
  }, [bookings]);

  // Apply search and filters for each tab
  const applyFilters = (items: Booking[], searchValue: string, filters: any[]) => {
    let filtered = [...items];

    // Apply search
    if (searchValue) {
      const query = searchValue.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.roomName.toLowerCase().includes(query) ||
          b.bookedByName.toLowerCase().includes(query) ||
          b.bookedByEmail.toLowerCase().includes(query) ||
          b.purpose.toLowerCase().includes(query)
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      if (!filter.value) return;

      switch (filter.id) {
        case 'status':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            filtered = filtered.filter((b) => filter.value.includes(b.status));
          }
          break;
        case 'roomId':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            filtered = filtered.filter((b) => filter.value.includes(b.roomId));
          }
          break;
        case 'purpose':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            filtered = filtered.filter((b) => filter.value.includes(b.purpose));
          }
          break;
        case 'recurrence':
          if (filter.value) {
            filtered = filtered.filter((b) => b.recurrence === filter.value);
          }
          break;
        case 'date':
          if (filter.value) {
            const date = new Date(filter.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => b.date === date);
          }
          break;
        case 'createdAt':
          if (filter.value) {
            const date = new Date(filter.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => b.createdAt.split('T')[0] === date);
          }
          break;
        case 'updatedAt':
          if (filter.value) {
            const date = new Date(filter.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => b.updatedAt.split('T')[0] === date);
          }
          break;
        case 'bookedByName':
          if (filter.value && typeof filter.value === 'string') {
            const query = filter.value.toLowerCase();
            filtered = filtered.filter((b) => 
              b.bookedByName.toLowerCase().includes(query)
            );
          }
          break;
        case 'minAttendees':
          if (typeof filter.value === 'number') {
            filtered = filtered.filter((b) => b.attendees >= filter.value);
          }
          break;
      }
    });

    return filtered;
  };

  const filteredPendingBookings = useMemo(() => 
    applyFilters(pendingBookings, pendingSearch, pendingFilters), 
    [pendingBookings, pendingSearch, pendingFilters]
  );

  const filteredTodayBookings = useMemo(() => 
    applyFilters(todayBookings, todaySearch, todayFilters), 
    [todayBookings, todaySearch, todayFilters]
  );

  const filteredUpcomingBookings = useMemo(() => 
    applyFilters(upcomingBookings, upcomingSearch, upcomingFilters), 
    [upcomingBookings, upcomingSearch, upcomingFilters]
  );

  const filteredAllBookings = useMemo(() => 
    applyFilters(bookings, allSearch, allFilters), 
    [bookings, allSearch, allFilters]
  );

  // Paginated data
  const paginatedPendingBookings = useMemo(() => {
    const start = pendingPageIndex * pendingPageSize;
    const end = start + pendingPageSize;
    return filteredPendingBookings.slice(start, end);
  }, [filteredPendingBookings, pendingPageIndex, pendingPageSize]);

  const paginatedTodayBookings = useMemo(() => {
    const start = todayPageIndex * todayPageSize;
    const end = start + todayPageSize;
    return filteredTodayBookings.slice(start, end);
  }, [filteredTodayBookings, todayPageIndex, todayPageSize]);

  const paginatedUpcomingBookings = useMemo(() => {
    const start = upcomingPageIndex * upcomingPageSize;
    const end = start + upcomingPageSize;
    return filteredUpcomingBookings.slice(start, end);
  }, [filteredUpcomingBookings, upcomingPageIndex, upcomingPageSize]);

  const paginatedAllBookings = useMemo(() => {
    const start = allPageIndex * allPageSize;
    const end = start + allPageSize;
    return filteredAllBookings.slice(start, end);
  }, [filteredAllBookings, allPageIndex, allPageSize]);

  // Actions
  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    // Could open a view modal here
    console.log('View booking:', booking);
  };

  const handleApprove = (booking: Booking) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Booking',
      description: `Are you sure you want to approve the booking for ${booking.roomName} by ${booking.bookedByName}?`,
      confirmText: 'Approve',
      variant: 'default',
      action: () => {
        console.log('Approve booking:', booking.id);
        // API call here
      },
    });
  };

  const handleReject = (booking: Booking) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Booking',
      description: `Are you sure you want to reject the booking for ${booking.roomName} by ${booking.bookedByName}?`,
      confirmText: 'Reject',
      variant: 'destructive',
      action: () => {
        console.log('Reject booking:', booking.id);
        // API call here
      },
    });
  };

  const handleCancel = (booking: Booking) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Booking',
      description: `Are you sure you want to cancel the booking for ${booking.roomName}? This action cannot be undone.`,
      confirmText: 'Cancel Booking',
      variant: 'destructive',
      action: () => {
        console.log('Cancel booking:', booking.id);
        // API call here
      },
    });
  };

  // Available columns
  const availableColumns = [
    { id: 'roomName', label: 'Room' },
    { id: 'bookedByName', label: 'Booked By' },
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'recurrence', label: 'Recurrence' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  // Filter configuration
  const filterConfig: any[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'roomId',
      label: 'Room',
      type: 'multiselect',
      options: mockRooms.map((room) => ({
        value: room.id,
        label: room.name,
      })),
    },
    {
      id: 'purpose',
      label: 'Purpose',
      type: 'multiselect',
      options: [
        { value: 'Team Meeting', label: 'Team Meeting' },
        { value: 'Client Meeting', label: 'Client Meeting' },
        { value: 'Presentation', label: 'Presentation' },
        { value: 'Training', label: 'Training' },
        { value: 'Board Meeting', label: 'Board Meeting' },
        { value: 'Interview', label: 'Interview' },
      ],
    },
    {
      id: 'recurrence',
      label: 'Recurrence',
      type: 'select',
      options: [
        { value: 'none', label: 'One-time' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
    },
    {
      id: 'date',
      label: 'Date',
      type: 'date',
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      type: 'date',
    },
    {
      id: 'updatedAt',
      label: 'Updated Date',
      type: 'date',
    },
    {
      id: 'bookedByName',
      label: 'Booked By',
      type: 'text',
      placeholder: 'Enter name',
    },
    {
      id: 'minAttendees',
      label: 'Min Attendees',
      type: 'number',
      placeholder: 'Enter minimum',
    },
  ];

  // Table columns generator
  const generateColumns = (showDate: boolean = true): ColumnDef<Booking>[] => [
    {
      accessorKey: 'roomName',
      header: 'Room',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.roomName}</div>
      ),
    },
    {
      accessorKey: 'bookedByName',
      header: 'Booked By',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.bookedByName}</span>
          <span className="text-xs text-muted-foreground">{row.original.bookedByEmail}</span>
        </div>
      ),
    },
    ...(showDate ? [{
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: { row: any }) => {
        try {
          return format(new Date(row.original.date), 'MMM dd, yyyy');
        } catch {
          return row.original.date;
        }
      },
    }] : []),
    {
      id: 'time',
      header: 'Time',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.startTime} - {row.original.endTime}
        </div>
      ),
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => row.original.purpose,
    },
    {
      accessorKey: 'attendees',
      header: 'Attendees',
      cell: ({ row }) => (
        <div className="text-center">{row.original.attendees}</div>
      ),
    },
    {
      accessorKey: 'recurrence',
      header: 'Recurrence',
      cell: ({ row }) => (
        <Badge variant="outline">
          {RECURRENCE_LABELS[row.original.recurrence]}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className={STATUS_COLORS[row.original.status]}>
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            {/* View Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleView(booking)}
              className="h-8 px-2"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            
            {/* Approve Button - only for pending */}
            {booking.status === 'pending' && (
              <Button 
                variant="default"
                size="sm"
                onClick={() => handleApprove(booking)}
                className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
            )}
            
            {/* Reject Button - only for pending */}
            {booking.status === 'pending' && (
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleReject(booking)}
                className="h-8 px-2 text-xs"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
            )}
            
            {/* Cancel Button - only for confirmed */}
            {booking.status === 'confirmed' && (
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(booking)}
                className="h-8 px-2 text-xs"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Filter visible columns
  const getVisibleColumns = (columns: ColumnDef<Booking>[], visibleIds: string[]) => {
    return columns.filter(col => {
      const columnId = ('accessorKey' in col ? col.accessorKey as string : col.id) || '';
      return visibleIds.includes(columnId);
    });
  };

  return (
    <>
      <PageLayout
        toolbar={
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold">Room Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage room bookings, approvals, and availability
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRooms}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.utilization}%</div>
                </CardContent>
              </Card>
            </div>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approvals ({filteredPendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="today">
              Today ({filteredTodayBookings.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({filteredUpcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Bookings ({filteredAllBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending" className="space-y-4">
            <GenericToolbar
              showSearch
              searchPlaceholder="Search pending bookings..."
              searchValue={pendingSearch}
              onSearchChange={setPendingSearch}
              showConfigureView
              allColumns={availableColumns}
              visibleColumns={pendingColumns}
              onVisibleColumnsChange={setPendingColumns}
              showFilters
              availableFilters={filterConfig}
              activeFilters={pendingFilters}
              onFiltersChange={setPendingFilters}
              showExport
              onExportAll={() => console.log('Export all pending')}
              onExportResults={() => console.log('Export pending results')}
              customActions={toolbarActions}
            />
            <DataTable
              data={paginatedPendingBookings}
              columns={getVisibleColumns(generateColumns(true), pendingColumns)}
              loading={loading}
              pagination={{
                pageIndex: pendingPageIndex,
                pageSize: pendingPageSize,
                totalPages: Math.ceil(filteredPendingBookings.length / pendingPageSize),
                totalItems: filteredPendingBookings.length,
                onPageChange: setPendingPageIndex,
                onPageSizeChange: setPendingPageSize,
              }}
              paginationVariant="default"
              fixedPagination={true}
              emptyState={{
                title: 'No pending bookings',
                description: 'All bookings have been reviewed',
              }}
            />
          </TabsContent>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-4">
            <GenericToolbar
              showSearch
              searchPlaceholder="Search today's bookings..."
              searchValue={todaySearch}
              onSearchChange={setTodaySearch}
              showConfigureView
              allColumns={availableColumns.filter(c => c.id !== 'date')}
              visibleColumns={todayColumns}
              onVisibleColumnsChange={setTodayColumns}
              showFilters
              availableFilters={filterConfig}
              activeFilters={todayFilters}
              onFiltersChange={setTodayFilters}
              showExport
              onExportAll={() => console.log('Export all today')}
              onExportResults={() => console.log('Export today results')}
              customActions={toolbarActions}
            />
            <DataTable
              data={paginatedTodayBookings}
              columns={getVisibleColumns(generateColumns(false), todayColumns)}
              loading={loading}
              pagination={{
                pageIndex: todayPageIndex,
                pageSize: todayPageSize,
                totalPages: Math.ceil(filteredTodayBookings.length / todayPageSize),
                totalItems: filteredTodayBookings.length,
                onPageChange: setTodayPageIndex,
                onPageSizeChange: setTodayPageSize,
              }}
              paginationVariant="default"
              fixedPagination={true}
              emptyState={{
                title: 'No bookings today',
                description: 'There are no room bookings scheduled for today',
              }}
            />
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <GenericToolbar
              showSearch
              searchPlaceholder="Search upcoming bookings..."
              searchValue={upcomingSearch}
              onSearchChange={setUpcomingSearch}
              showConfigureView
              allColumns={availableColumns}
              visibleColumns={upcomingColumns}
              onVisibleColumnsChange={setUpcomingColumns}
              showFilters
              availableFilters={filterConfig}
              activeFilters={upcomingFilters}
              onFiltersChange={setUpcomingFilters}
              showExport
              onExportAll={() => console.log('Export all upcoming')}
              onExportResults={() => console.log('Export upcoming results')}
              customActions={toolbarActions}
            />
            <DataTable
              data={paginatedUpcomingBookings}
              columns={getVisibleColumns(generateColumns(true), upcomingColumns)}
              loading={loading}
              pagination={{
                pageIndex: upcomingPageIndex,
                pageSize: upcomingPageSize,
                totalPages: Math.ceil(filteredUpcomingBookings.length / upcomingPageSize),
                totalItems: filteredUpcomingBookings.length,
                onPageChange: setUpcomingPageIndex,
                onPageSizeChange: setUpcomingPageSize,
              }}
              paginationVariant="default"
              fixedPagination={true}
              emptyState={{
                title: 'No upcoming bookings',
                description: 'There are no future room bookings scheduled',
              }}
            />
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="all" className="space-y-4">
            <GenericToolbar
              showSearch
              searchPlaceholder="Search all bookings..."
              searchValue={allSearch}
              onSearchChange={setAllSearch}
              showConfigureView
              allColumns={availableColumns}
              visibleColumns={allColumns}
              onVisibleColumnsChange={setAllColumns}
              showFilters
              availableFilters={filterConfig}
              activeFilters={allFilters}
              onFiltersChange={setAllFilters}
              showExport
              onExportAll={() => console.log('Export all bookings')}
              onExportResults={() => console.log('Export all results')}
              customActions={toolbarActions}
            />
            <DataTable
              data={paginatedAllBookings}
              columns={getVisibleColumns(generateColumns(true), allColumns)}
              loading={loading}
              pagination={{
                pageIndex: allPageIndex,
                pageSize: allPageSize,
                totalPages: Math.ceil(filteredAllBookings.length / allPageSize),
                totalItems: filteredAllBookings.length,
                onPageChange: setAllPageIndex,
                onPageSizeChange: setAllPageSize,
              }}
              paginationVariant="default"
              fixedPagination={true}
              emptyState={{
                title: 'No bookings found',
                description: 'Get started by creating your first room booking',
                action: {
                  label: 'Book a Room',
                  onClick: () => navigate('/room-management/browse'),
                },
              }}
            />
          </TabsContent>
        </Tabs>
      </PageLayout>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </>
  );
}
