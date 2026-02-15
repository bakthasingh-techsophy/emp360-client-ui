/**
 * Employment History Display Card for Self-Service Profile
 * View-only display of previous work experience
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineItem, TimelineTypeConfig } from '@/components/timeline';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { EmploymentHistoryItem } from '@/modules/user-management/types/onboarding.types';
import UniversalSearchRequest from '@/types/search';
import { format } from 'date-fns';

export function EmploymentHistoryCard() {
  const { employeeId } = useAuth();
  const { refreshEmploymentHistory } = useUserManagement();
  const [items, setItems] = useState<EmploymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!employeeId) return;
    setIsLoading(true);
    const searchRequest: UniversalSearchRequest = {
      filters: {
        and: {
          employeeId: employeeId,
        },
      },
    };
    const result = await refreshEmploymentHistory(searchRequest, 0, 100);
    if (result && result.content) {
      setItems(result.content as any);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Employment History
          </CardTitle>
          <CardDescription>Previous work experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No employment history available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Timeline configuration
  const timelineItems: TimelineItem<EmploymentHistoryItem>[] = items
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map((item) => ({
      id: item.id || `${item.companyName}-${item.startDate}`,
      type: 'employment',
      timestamp: new Date(item.startDate),
      data: item,
    }));

  const typeConfigs: TimelineTypeConfig<EmploymentHistoryItem>[] = [
    {
      type: 'employment',
      renderer: (item) => (
        <Card className="rounded-md border shadow-sm">
          <CardHeader className="p-4 py-3">
            <CardTitle className="text-base font-semibold">{item.data.role}</CardTitle>
            <CardDescription className="text-sm font-medium">{item.data.companyName}</CardDescription>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(item.data.startDate), 'MMM yyyy')} -{' '}
                {item.data.endDate ? format(new Date(item.data.endDate), 'MMM yyyy') : 'Present'}
              </div>
              {item.data.tenure && <Badge variant="outline">{item.data.tenure}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="p-4 py-3 pt-0 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {item.data.location}
            </div>
          </CardContent>
        </Card>
      ),
      icon: { component: Briefcase },
      color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Employment History
          </CardTitle>
          <CardDescription>Previous work experience and tenure</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <Timeline items={timelineItems} typeConfigs={typeConfigs} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No employment history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
