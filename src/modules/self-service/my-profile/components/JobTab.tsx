import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Building2, User, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSelfService } from '@/contexts/SelfServiceContext';

interface JobTabProps {
    employeeId: string;
}

export function JobTab({ employeeId }: JobTabProps) {
    const { getJobDetailsSelfService } = useSelfService();
    const [jobDetail, setJobDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Load job details snapshot on mount
    const loadJobDetailsSnapshot = async () => {
        try {
            setIsLoading(true);
            const result = await getJobDetailsSelfService();
            if (result) {
                setJobDetail(result);
            }
        } catch (error) {
            console.error('Error loading job details snapshot:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobDetailsSnapshot();
    }, []);

    if (isLoading) {
        return (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60 mt-2" />
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>
                    View your current employment information and reporting structure.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1 group">
                        <Label className="text-muted-foreground">Employee ID</Label>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono">
                                {employeeId}
                            </span>
                            <button
                                onClick={() => handleCopy(employeeId, "emp-id")}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title="Copy to clipboard"
                            >
                                {copiedId === "emp-id" ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Designation</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary/70" />
                            {jobDetail?.designation || '-'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Department</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary/70" />
                            {jobDetail?.department || '-'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Reporting Manager</Label>
                        <div className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-primary/70" />
                            {jobDetail?.reportingTo || jobDetail?.reportingManager || '-'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Employment Type</Label>
                        <div className="font-medium">
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                                {jobDetail?.employeeType || '-'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Date of Joining</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/70" />
                            {formatDate(jobDetail?.joiningDate)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Work Location</Label>
                        <div className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            {jobDetail?.workLocation || '-'}
                        </div>
                    </div>

                    <div className="space-y-1 group">
                        <Label className="text-muted-foreground">Official Email</Label>
                        <div className="font-medium truncate flex items-center gap-2">
                            <span className="truncate">{jobDetail?.email || '-'}</span>
                            {jobDetail?.email && (
                                <button
                                    onClick={() => handleCopy(jobDetail.email, "work-email")}
                                    className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                    title="Copy to clipboard"
                                >
                                    {copiedId === "work-email" ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
