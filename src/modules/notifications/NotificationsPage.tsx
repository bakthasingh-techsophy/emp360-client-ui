/**
 * Notifications Page Component
 * Displays and manages space connection requests and other notifications
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, X, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageLayout } from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Notification, SpaceConnectionRequestMetadata } from './notificationTypes';
import { useNotification } from '@/contexts/NotificationContext';

// Type alias for space connection notifications
type SpaceConnectionNotification = Notification<SpaceConnectionRequestMetadata>;

// Track processed requests with their status
type ProcessedRequest = {
  notificationId: string;
  decision: 'approved' | 'rejected';
  timestamp: string;
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshNotifications, updateNotification } = useNotification();
  const [notifications, setNotifications] = useState<SpaceConnectionNotification[]>([]);
  const [processedRequests, setProcessedRequests] = useState<ProcessedRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadProcessedRequests();
  }, []);

  const loadProcessedRequests = () => {
    const stored = localStorage.getItem('processedSpaceRequests');
    if (stored) {
      setProcessedRequests(JSON.parse(stored));
    }
  };

  const saveProcessedRequest = (notificationId: string, decision: 'approved' | 'rejected') => {
    const newRequest: ProcessedRequest = {
      notificationId,
      decision,
      timestamp: new Date().toISOString(),
    };
    const updated = [...processedRequests, newRequest];
    setProcessedRequests(updated);
    localStorage.setItem('processedSpaceRequests', JSON.stringify(updated));
  };

  const getRequestDecision = (notificationId: string): 'approved' | 'rejected' | null => {
    const request = processedRequests.find(r => r.notificationId === notificationId);
    return request?.decision || null;
  };

  const loadNotifications = async () => {
    try {
      // Use context to load notifications
      const response = await refreshNotifications<SpaceConnectionRequestMetadata>(
        {}, // Empty search criteria to get all
        0,  // page
        100 // pageSize
      );
      
      if (response) {
        // Filter for space connection request type
        const spaceNotifications = response.content.filter(
          n => n.type === 'space_connection_request'
        ) as SpaceConnectionNotification[];
        
        setNotifications(spaceNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleApprove = async (notification: SpaceConnectionNotification) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark notification as read using context
      const updated = await updateNotification(
        notification.id,
        { status: 'read' }
      );

      if (updated) {
        // Save the approval decision
        saveProcessedRequest(notification.id, 'approved');
        
        // Reload notifications to reflect changes
        await loadNotifications();
      }

      toast({
        title: 'Request Approved',
        description: `Company ${notification.metadata.requestingCompanyId} can now access the shared space.`,
      });

      // TODO: Send approval notification to requesting company
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (notification: SpaceConnectionNotification) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark notification as read using context
      const updated = await updateNotification(
        notification.id,
        { status: 'read' }
      );

      if (updated) {
        // Save the rejection decision
        saveProcessedRequest(notification.id, 'rejected');
        
        // Reload notifications to reflect changes
        await loadNotifications();
      }

      toast({
        title: 'Request Rejected',
        description: `Connection request from Company ${notification.metadata.requestingCompanyId} has been rejected.`,
      });

      // TODO: Send rejection notification to requesting company
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingNotifications = notifications.filter(n => n.status === 'unread');
  const processedNotifications = notifications.filter(n => n.status === 'read');

  return (
    <PageLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/visitor-management')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage space connection requests and other notifications
            </p>
          </div>
          {pendingNotifications.length > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {pendingNotifications.length} pending
            </Badge>
          )}
        </div>

        {/* Pending Requests */}
        {pendingNotifications.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Pending Requests</h2>
              <p className="text-sm text-muted-foreground">Review and respond to connection requests</p>
            </div>

            {pendingNotifications.map((notification) => (
              <Card key={notification.id} className="border-orange-200 dark:border-orange-900">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Space Connection Request</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'MMM dd, yyyy hh:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Company {notification.metadata.requestingCompanyId}</span> wants to connect to your space
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      Space ID: {notification.metadata.spaceId}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Request Message:</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(notification)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(notification)}
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Previous Notifications */}
        {processedNotifications.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Previous Notifications</h2>
              <p className="text-sm text-muted-foreground">Your notification history</p>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {processedNotifications.map((notification) => {
                  const decision = getRequestDecision(notification.id);
                  return (
                  <Card key={notification.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            decision === 'approved' 
                              ? 'bg-green-500/10' 
                              : 'bg-red-500/10'
                          }`}>
                            {decision === 'approved' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              Company {notification.metadata.requestingCompanyId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={decision === 'approved' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {decision}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any notifications right now. 
                Connection requests from other companies will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
