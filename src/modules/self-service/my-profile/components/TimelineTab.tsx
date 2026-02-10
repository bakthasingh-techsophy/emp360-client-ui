import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserProfile, TimelineEvent } from '../types';
import { Timeline, TimelineItem, TimelineTypeConfig } from '@/components/timeline';
import { UserPlus, TrendingUp, Shuffle, Star, Circle, Calendar } from 'lucide-react';

interface TimelineTabProps {
    profile: UserProfile;
}

export function TimelineTab({ profile }: TimelineTabProps) {
    // 1. Prepare data
    const items: TimelineItem<TimelineEvent>[] = profile.timeline.map((event) => ({
        id: event.id,
        type: event.type,
        timestamp: new Date(event.date),
        data: event,
    }));

    // 2. Configure renderers
    const typeConfigs: TimelineTypeConfig<TimelineEvent>[] = [
        {
            type: 'Joining',
            renderer: (item) => (
                <Card className="rounded-md border shadow-sm">
                    <CardHeader className="p-4 py-3">
                        <CardTitle className="text-base font-semibold">{item.data.title}</CardTitle>
                        <CardDescription className="text-xs">
                            {item.timestamp.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </CardDescription>
                    </CardHeader>
                    {item.data.description && (
                        <CardContent className="p-4 py-3 pt-0 text-sm text-muted-foreground">
                            {item.data.description}
                        </CardContent>
                    )}
                </Card>
            ),
            icon: { component: UserPlus },
            color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' },
        },
        {
            type: 'Promotion',
            renderer: (item) => (
                <Card className="rounded-md border shadow-sm">
                    <CardHeader className="p-4 py-3">
                        <CardTitle className="text-base font-semibold">{item.data.title}</CardTitle>
                        <CardDescription className="text-xs">
                            {item.timestamp.toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 py-3 pt-0 text-sm">
                        {item.data.description}
                    </CardContent>
                </Card>
            ),
            icon: { component: TrendingUp },
            color: { dot: 'bg-green-500/10', iconColor: 'text-green-600' },
        },
        {
            type: 'Department Change',
            renderer: (item) => (
                <Card className="rounded-md border shadow-sm">
                    <CardHeader className="p-4 py-3">
                        <CardTitle className="text-base font-semibold">{item.data.title}</CardTitle>
                        <CardDescription className="text-xs">
                            {item.timestamp.toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 py-3 pt-0 text-sm">
                        {item.data.description}
                    </CardContent>
                </Card>
            ),
            icon: { component: Shuffle },
            color: { dot: 'bg-orange-500/10', iconColor: 'text-orange-600' },
        },
        {
            type: 'Appraisal',
            renderer: (item) => (
                <Card className="rounded-md border shadow-sm">
                    <CardHeader className="p-4 py-3">
                        <CardTitle className="text-base font-semibold">{item.data.title}</CardTitle>
                        <CardDescription className="text-xs">
                            {item.timestamp.toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 py-3 pt-0 text-sm">
                        {item.data.description}
                    </CardContent>
                </Card>
            ),
            icon: { component: Star },
            color: { dot: 'bg-purple-500/10', iconColor: 'text-purple-600' },
        },
        {
            type: 'Other',
            renderer: (item) => (
                <Card className="rounded-md border shadow-sm">
                    <CardHeader className="p-4 py-3">
                        <CardTitle className="text-base font-semibold">{item.data.title}</CardTitle>
                        <CardDescription className="text-xs">
                            {item.timestamp.toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 py-3 pt-0 text-sm">
                        {item.data.description}
                    </CardContent>
                </Card>
            ),
            icon: { component: Circle },
            color: { dot: 'bg-gray-500/10', iconColor: 'text-gray-600' },
        },
    ];

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Career Timeline</CardTitle>
                <CardDescription>
                    Your professional journey and key milestones within the organization.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Timeline
                    items={items}
                    typeConfigs={typeConfigs}
                    showPagination={false}
                />
            </CardContent>
        </Card>
    );
}
