import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserProfile } from '../types';
import { Briefcase, MapPin, Calendar, Building2, User } from 'lucide-react';

interface JobTabProps {
    profile: UserProfile;
}

export function JobTab({ profile }: JobTabProps) {
    const { job } = profile;

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
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Employee ID</Label>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono">
                                {job.employeeId}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Designation</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary/70" />
                            {job.designation}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Department</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary/70" />
                            {job.department}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Reporting Manager</Label>
                        <div className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-primary/70" />
                            {job.reportingManager}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Employment Type</Label>
                        <div className="font-medium">{job.employmentType}</div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Date of Joining</Label>
                        <div className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/70" />
                            {job.dateOfJoining}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Work Location</Label>
                        <div className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            {job.workLocation}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
