/**
 * Event History Display Card for Self-Service Profile
 * Minimal and professional design using shadcn default colors
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { EventHistoryItem, EventType } from '@/modules/user-management/types/onboarding.types';
import UniversalSearchRequest from '@/types/search';
import { format } from 'date-fns';

export function EventHistoryCard() {
  const { employeeId } = useAuth();
  const { refreshEventHistory } = useUserManagement();
  const [items, setItems] = useState<EventHistoryItem[]>([]);

  const fetchData = async () => {
    if (!employeeId) return;
    const searchRequest: UniversalSearchRequest = {
      filters: {
        and: {
          employeeId: employeeId,
        },
      },
      sort: { date: -1 },
    };
    const result = await refreshEventHistory(searchRequest, 0, 100);
    if (result && result.content) {
      setItems(result.content as any);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const getTypeLabel = (type: EventType): string => {
    const labels: Record<EventType, string> = {
      [EventType.PROMOTION]: 'Promotion',
      [EventType.DEMOTION]: 'Demotion',
      [EventType.TRANSFER]: 'Transfer',
      [EventType.ROLE_CHANGE]: 'Role Change',
      [EventType.JOINING]: 'Joining',
      [EventType.RESIGNATION]: 'Resignation',
      [EventType.OTHER]: 'Other',
    };
    return labels[type] || type;
  };

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Event History
          </CardTitle>
          <CardDescription>Career progression timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground">No events recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Event History
        </CardTitle>
        <CardDescription>Career progression timeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <div key={item.id} className="relative pl-8">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-3 top-6 h-10 w-px bg-border"></div>
                )}

                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center" />

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <h4 className="font-semibold text-base text-foreground leading-tight">
                      {getTypeLabel(item.type)}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(item.date), 'MMMM dd, yyyy')}
                    </p>

                    {/* Event details */}
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {item.oldRole && item.newRole && (
                        <div>
                          <span className="text-foreground">{item.oldRole}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-foreground">{item.newRole}</span>
                        </div>
                      )}
                      {item.oldDepartment && item.newDepartment && (
                        <div>
                          <span className="text-foreground">{item.oldDepartment}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-foreground">{item.newDepartment}</span>
                        </div>
                      )}
                      {item.reason && (
                        <div>
                          {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
