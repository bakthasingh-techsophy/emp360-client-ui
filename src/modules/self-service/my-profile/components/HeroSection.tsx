import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Building2, MapPin, Briefcase, Clock } from 'lucide-react';
import { useSelfService } from '@/contexts/SelfServiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { decodeJWT } from '@/lib/tokenUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSectionProps {
    employeeId: string;
}

export function HeroSection({ employeeId }: HeroSectionProps) {
    const { getJobDetailsSelfService } = useSelfService();
    const { token } = useAuth();
    const [jobDetail, setJobDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <div className="relative w-full bg-card rounded-lg border shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Get name from token
    const tokenData = token ? decodeJWT(token) : null;
    const fullName = tokenData?.name || `${tokenData?.given_name || ''} ${tokenData?.family_name || ''}`.trim() || 'Employee';
    const designation = jobDetail?.designation || 'Employee';
    const department = jobDetail?.department || 'Engineering';
    const location = jobDetail?.workLocation || 'Not specified';
    const employeeType = jobDetail?.employeeType || 'Not specified';
    const shift = jobDetail?.shift || 'Not specified';
    const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();

    return (
        <div className="relative w-full bg-card rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Profile Image with Edit Overlay */}
                <div className="relative group">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-md">
                        <AvatarImage src="https://github.com/shadcn.png" alt={fullName} />
                        <AvatarFallback className="text-2xl md:text-3xl font-bold bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <button
                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Edit Profile Picture"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{fullName}</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                {designation} <span className="text-border">|</span> {employeeId}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-primary/70" />
                            <span>{department}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-primary/70" />
                            <span>{employeeType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary/70" />
                            <span>{shift}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
