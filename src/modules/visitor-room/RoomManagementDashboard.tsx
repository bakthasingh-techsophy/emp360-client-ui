/**
 * Room Management Entry Point
 * Routes to appropriate dashboard based on user role:
 * - Regular users: See MyBookings dashboard (their bookings, history, quick stats)
 * - Admin/Receptionist: See admin dashboard (pending approvals, all bookings, management)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyBookings } from './MyBookings';
import { RoomManagementAdmin } from './RoomManagementAdmin';

export function RoomManagement() {
  // TODO: Replace with actual auth context
  const userRole = 'admin'; // This should come from useAuth() or AuthContext
  
  const isAdmin = userRole === 'admin' || userRole === 'receptionist';

  // Render appropriate dashboard based on role
  if (isAdmin) {
    // Admin sees: pending approvals, today's bookings, upcoming bookings, all bookings
    return <RoomManagementAdmin />;
  } else {
    // Regular users see: their bookings, history, quick actions, popular rooms
    return <MyBookings />;
  }
}
  
  // Separate state for each tab
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingFilters, setPendingFilters] = useState<any[]>([]);
  const [pendingColumns, setPendingColumns] = useState<string[]>([
    'title', 'roomName', 'date', 'time', 'bookedByName', 'attendees', 'purpose', 'recurrence', 'status', 'actions'
  ]);
  const [pendingPageIndex, setPendingPageIndex] = useState(0);
  const [pendingPageSize, setPendingPageSize] = useState(10);

  const [todaySearch, setTodaySearch] = useState('');
  const [todayFilters, setTodayFilters] = useState<any[]>([]);
  const [todayColumns, setTodayColumns] = useState<string[]>([
    'title', 'roomName', 'time', 'bookedByName', 'attendees', 'purpose', 'recurrence', 'status', 'actions'
  ]);
  const [todayPageIndex, setTodayPageIndex] = useState(0);
  const [todayPageSize, setTodayPageSize] = useState(10);

  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [upcomingFilters, setUpcomingFilters] = useState<any[]>([]);
  const [upcomingColumns, setUpcomingColumns] = useState<string[]>([
    'title', 'roomName', 'date', 'time', 'bookedByName', 'attendees', 'purpose', 'recurrence', 'status', 'actions'
  ]);
  const [upcomingPageIndex, setUpcomingPageIndex] = useState(0);
  const [upcomingPageSize, setUpcomingPageSize] = useState(10);

  const [allSearch, setAllSearch] = useState('');
  const [allFilters, setAllFilters] = useState<any[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([
    'title', 'roomName', 'date', 'time', 'bookedByName', 'attendees', 'purpose', 'recurrence', 'status', 'actions'
  ]);
  const [allPageIndex, setAllPageIndex] = useState(0);
  const [allPageSize, setAllPageSize] = useState(10);

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

  // Available columns for configure view
  const availableColumns = [
    { id: 'title', label: 'Meeting Title' },
    { id: 'roomName', label: 'Room' },
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'bookedByName', label: 'Booked By' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'recurrence', label: 'Recurrence' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  // Filter bookings based on tab and filters
  const getFilteredBookings = (
    tabType: 'pending' | 'today' | 'upcoming' | 'all',
    searchQuery: string,
    filters: any[]
  ) => {
    let filtered = [...mockBookings];

    // Apply tab-specific filtering
    switch (tabType) {
      case 'pending':
        filtered = filtered.filter((b) => b.status === 'pending');
        break;
      case 'today':
        filtered = filtered.filter((b) => isToday(new Date(b.startDateTime)));
        break;
      case 'upcoming':
        filtered = filtered.filter(
          (b) =>
            isFuture(new Date(b.startDateTime)) &&
            !isToday(new Date(b.startDateTime))
        );
        break;
      case 'all':
        // No additional filtering
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.roomName.toLowerCase().includes(query) ||
          b.bookedByName.toLowerCase().includes(query) ||
          b.purpose.toLowerCase().includes(query)
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      if (!filter?.value) return;

      switch (filter?.filterId) {
        case 'status':
          if (Array.isArray(filter?.value) && filter?.value.length > 0) {
            filtered = filtered.filter((b) => filter?.value.includes(b.status));
          }
          break;
        case 'roomId':
          if (Array.isArray(filter?.value) && filter?.value.length > 0) {
            filtered = filtered.filter((b) => filter?.value.includes(b.roomId));
          }
          break;
        case 'purpose':
          if (Array.isArray(filter?.value) && filter?.value.length > 0) {
            filtered = filtered.filter((b) => filter?.value.includes(b.purpose));
          }
          break;
        case 'recurrence':
          if (filter?.value && typeof filter?.value === 'string') {
            filtered = filtered.filter((b) => b.recurrence === filter?.value);
          }
          break;
        case 'date':
          if (filter?.value) {
            const dateStr = new Date(filter?.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => b.date === dateStr);
          }
          break;
        case 'createdAt':
          if (filter?.value) {
            const dateStr = new Date(filter?.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => {
              const createdDate = new Date(b.createdAt).toISOString().split('T')[0];
              return createdDate === dateStr;
            });
          }
          break;
        case 'updatedAt':
          if (filter?.value) {
            const dateStr = new Date(filter?.value).toISOString().split('T')[0];
            filtered = filtered.filter((b) => {
              const updatedDate = new Date(b.updatedAt).toISOString().split('T')[0];
              return updatedDate === dateStr;
            });
          }
          break;
        case 'bookedByName':
          if (filter?.value && typeof filter?.value === 'string') {
            const query = filter?.value.toLowerCase();
            filtered = filtered.filter((b) =>
              b.bookedByName.toLowerCase().includes(query)
            );
          }
          break;
        case 'minAttendees':
          if (filter?.value && typeof filter?.value === 'number') {
            filtered = filtered.filter((b) => b.numberOfAttendees >= filter?.value);
          }
          break;
      }
    });

    return filtered;
  };

  // Calculate filtered data for each tab
  const pendingBookings = useMemo(
    () => getFilteredBookings('pending', pendingSearch, pendingFilters),
    [pendingSearch, pendingFilters]
  );

  const todayBookings = useMemo(
    () => getFilteredBookings('today', todaySearch, todayFilters),
    [todaySearch, todayFilters]
  );

  const upcomingBookings = useMemo(
    () => getFilteredBookings('upcoming', upcomingSearch, upcomingFilters),
    [upcomingSearch, upcomingFilters]
  );

  const allBookings = useMemo(
    () => getFilteredBookings('all', allSearch, allFilters),
    [allSearch, allFilters]
  );

  // Paginated data for each tab
  const paginatedPending = useMemo(() => {
    const start = pendingPageIndex * pendingPageSize;
    return pendingBookings.slice(start, start + pendingPageSize);
  }, [pendingBookings, pendingPageIndex, pendingPageSize]);

  const paginatedToday = useMemo(() => {
    const start = todayPageIndex * todayPageSize;
    return todayBookings.slice(start, start + todayPageSize);
  }, [todayBookings, todayPageIndex, todayPageSize]);

  const paginatedUpcoming = useMemo(() => {
    const start = upcomingPageIndex * upcomingPageSize;
    return upcomingBookings.slice(start, start + upcomingPageSize);
  }, [upcomingBookings, upcomingPageIndex, upcomingPageSize]);

  const paginatedAll = useMemo(() => {
    const start = allPageIndex * allPageSize;
    return allBookings.slice(start, start + allPageSize);
  }, [allBookings, allPageIndex, allPageSize]);

  // Statistics
  const stats = useMemo(() => {
    const todayCount = mockBookings.filter((b) =>
      isToday(new Date(b.startDateTime))
    ).length;
    const pendingCount = mockBookings.filter((b) => b.status === 'pending').length;

    return {
      totalRooms: mockRooms.length,
      availableRooms: mockRooms.filter((r) => r.status === 'available').length,
      todayBookings: todayCount,
      pendingApprovals: pendingCount,
      totalBookings: mockBookings.length,
      utilization: Math.round(
        (mockRooms.reduce((sum, r) => sum + (r.utilizationRate || 0), 0) /
          mockRooms.length)
      ),
    };
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  // Action handlers
  const handleViewDetails = (booking: RoomBooking) => {
    navigate(
      `/room-management/booking-form?roomId=${booking.roomId}&date=${booking.date}`
    );
  };

  const handleApprove = (booking: RoomBooking) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Booking',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to approve <strong>{booking.title}</strong>?
          </p>
          <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-md">
            <div>
              <strong>Room:</strong> {booking.roomName}
            </div>
            <div>
              <strong>Date:</strong> {getDateLabel(booking.startDateTime)}
            </div>
            <div>
              <strong>Time:</strong> {format(new Date(booking.startDateTime), 'HH:mm')} -{' '}
              {format(new Date(booking.endDateTime), 'HH:mm')}
            </div>
            <div>
              <strong>Booked By:</strong> {booking.bookedByName}
            </div>
          </div>
        </div>
      ),
      confirmText: 'Approve',
      variant: 'default',
      action: () => {
        console.log('Approve booking:', booking.id);
        // API call here
      },
    });
  };

  const handleReject = (booking: RoomBooking) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Booking',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to reject <strong>{booking.title}</strong>?
          </p>
          <p className="text-destructive text-xs">
            The booking will be cancelled and the user will be notified.
          </p>
        </div>
      ),
      confirmText: 'Reject',
      variant: 'destructive',
      action: () => {
        console.log('Reject booking:', booking.id);
        // API call here
      },
    });
  };

  const handleCancel = (booking: RoomBooking) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Booking',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to cancel <strong>{booking.title}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All participants will be notified.
          </p>
        </div>
      ),
      confirmText: 'Cancel Booking',
      variant: 'destructive',
      action: () => {
        console.log('Cancel booking:', booking.id);
        // API call here
      },
    });
  };

  // Table columns definition
  const columns: ColumnDef<RoomBooking>[] = [
    {
      accessorKey: 'title',
      header: 'Meeting Title',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            ID: {row.original.id}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'roomName',
      header: 'Room',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.roomName}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span>{getDateLabel(row.original.startDateTime)}</span>
      ),
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(row.original.startDateTime), 'HH:mm')} -{' '}
            {format(new Date(row.original.endDateTime), 'HH:mm')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'bookedByName',
      header: 'Booked By',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.bookedByName}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.bookedByEmail}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'attendees',
      header: () => <div className="text-center">Attendees</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.numberOfAttendees}</span>
        </div>
      ),
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.purpose}</Badge>
      ),
    },
    {
      accessorKey: 'recurrence',
      header: () => <div className="text-center">Recurrence</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.recurrence !== 'none' ? (
            <Badge variant="secondary" className="text-xs">
              {row.original.recurrence}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">One-time</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status}
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
          <div className="flex items-center justify-center gap-2">
            {/* View Button - Always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(booking)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Approve Button - Only for pending */}
            {booking.status === 'pending' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprove(booking)}
                className="h-8 px-3 bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            )}

            {/* Reject Button - Only for pending */}
            {booking.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(booking)}
                className="h-8 px-3"
              >
                Reject
              </Button>
            )}

            {/* Cancel Button - Only for confirmed */}
            {booking.status === 'confirmed' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(booking)}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
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
        { value: 'Meeting', label: 'Meeting' },
        { value: 'Interview', label: 'Interview' },
        { value: 'Training', label: 'Training' },
        { value: 'Workshop', label: 'Workshop' },
        { value: 'Presentation', label: 'Presentation' },
        { value: 'Discussion', label: 'Discussion' },
        { value: 'Other', label: 'Other' },
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
      label: 'Booking Date',
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
      placeholder: 'Enter name or email',
    },
    {
      id: 'minAttendees',
      label: 'Min Attendees',
      type: 'number',
      placeholder: 'Minimum number of attendees',
    },
  ];

  // Helper function to get visible columns
  const getVisibleColumns = (visibleColumnIds: string[]) => {
    return columns.filter(col => {
      const columnId = ('accessorKey' in col ? col.accessorKey as string : col.id) || '';
      return visibleColumnIds.includes(columnId);
    });
  };

  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Room Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage all room bookings, approvals, and room settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/room-management/room-form')}>
                <Building2 className="h-4 w-4 mr-2" />
                Manage Rooms
              </Button>
              <Button onClick={() => navigate('/room-management/browse')}>
                <Plus className="h-4 w-4 mr-2" />
                Book for Someone
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Rooms</p>
              </div>
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.availableRooms}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.todayBookings}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingApprovals}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-muted-foreground">Utilization</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.utilization}%
              </p>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending Approvals ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="today">
                Today ({todayBookings.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Bookings ({allBookings.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
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
              />

              <DataTable
                ref={tableRef}
                data={paginatedPending}
                columns={getVisibleColumns(pendingColumns)}
                loading={loading}
                pagination={{
                  pageIndex: pendingPageIndex,
                  pageSize: pendingPageSize,
                  totalPages: Math.ceil(pendingBookings.length / pendingPageSize),
                  totalItems: pendingBookings.length,
                  onPageChange: setPendingPageIndex,
                  onPageSizeChange: setPendingPageSize,
                }}
                paginationVariant="default"
                fixedPagination={true}
                emptyState={{
                  title: 'No Pending Approvals',
                  description: 'All bookings have been processed',
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
                allColumns={availableColumns}
                visibleColumns={todayColumns}
                onVisibleColumnsChange={setTodayColumns}
                showFilters
                availableFilters={filterConfig}
                activeFilters={todayFilters}
                onFiltersChange={setTodayFilters}
                showExport
                onExportAll={() => console.log('Export all today')}
                onExportResults={() => console.log('Export today results')}
              />

              <DataTable
                ref={tableRef}
                data={paginatedToday}
                columns={getVisibleColumns(todayColumns)}
                loading={loading}
                pagination={{
                  pageIndex: todayPageIndex,
                  pageSize: todayPageSize,
                  totalPages: Math.ceil(todayBookings.length / todayPageSize),
                  totalItems: todayBookings.length,
                  onPageChange: setTodayPageIndex,
                  onPageSizeChange: setTodayPageSize,
                }}
                paginationVariant="default"
                fixedPagination={true}
                emptyState={{
                  title: 'No Bookings Today',
                  description: 'All rooms are available today',
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
              />

              <DataTable
                ref={tableRef}
                data={paginatedUpcoming}
                columns={getVisibleColumns(upcomingColumns)}
                loading={loading}
                pagination={{
                  pageIndex: upcomingPageIndex,
                  pageSize: upcomingPageSize,
                  totalPages: Math.ceil(upcomingBookings.length / upcomingPageSize),
                  totalItems: upcomingBookings.length,
                  onPageChange: setUpcomingPageIndex,
                  onPageSizeChange: setUpcomingPageSize,
                }}
                paginationVariant="default"
                fixedPagination={true}
                emptyState={{
                  title: 'No Upcoming Bookings',
                  description: 'No bookings scheduled for the future',
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
              />

              <DataTable
                ref={tableRef}
                data={paginatedAll}
                columns={getVisibleColumns(allColumns)}
                loading={loading}
                pagination={{
                  pageIndex: allPageIndex,
                  pageSize: allPageSize,
                  totalPages: Math.ceil(allBookings.length / allPageSize),
                  totalItems: allBookings.length,
                  onPageChange: setAllPageIndex,
                  onPageSizeChange: setAllPageSize,
                }}
                paginationVariant="default"
                fixedPagination={true}
                emptyState={{
                  title: 'No Bookings Found',
                  description: 'Try adjusting your filters or search query',
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
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
