import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '../types';
import { Star, Trophy, Target } from 'lucide-react';

interface PerformanceTabProps {
    profile: UserProfile;
}

export function PerformanceTab({ profile }: PerformanceTabProps) {
    const getGoalStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'default'; // primary
            case 'On Track': return 'secondary';
            case 'Delayed': return 'destructive';
            case 'At Risk': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {profile.performance.map((review) => (
                <Card key={review.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Performance Review {review.period}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full font-bold">
                            <span>{review.rating}</span>
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Feedback Summary</div>
                            <p className="leading-relaxed">{review.feedbackSummary}</p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Target className="w-4 h-4" />
                                Goals Status:
                            </div>
                            <Badge variant={getGoalStatusColor(review.goalsStatus) as any}>
                                {review.goalsStatus}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {profile.performance.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                        No performance reviews found.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
