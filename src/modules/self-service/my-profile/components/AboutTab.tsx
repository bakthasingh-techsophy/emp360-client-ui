import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSelfService } from '@/contexts/SelfServiceContext';

interface AboutTabProps {
    employeeId?: string; // No longer needed for self-service API
}

export function AboutTab({ employeeId: _employeeId }: AboutTabProps) {
    const { getGeneralDetailsSelfService } = useSelfService();
    const [generalDetails, setGeneralDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load general details snapshot on mount
    const loadGeneralDetailsSnapshot = async () => {
        try {
            setIsLoading(true);
            const result = await getGeneralDetailsSelfService();
            if (result) {
                setGeneralDetails(result);
            }
        } catch (error) {
            console.error('Error loading general details snapshot:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGeneralDetailsSnapshot();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const about = generalDetails?.about;
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        About You
                    </CardTitle>
                    <CardDescription>Your professional overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {about?.aboutMe && (
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
                                <p className="text-base leading-relaxed whitespace-pre-wrap">
                                    {about.aboutMe}
                                </p>
                            </div>
                        )}
                        {about?.bloodGroup && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Blood Group</p>
                                <Badge variant="secondary">{about.bloodGroup}</Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information Card */}
            {about?.personalEmail && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Contact Information
                        </CardTitle>
                        <CardDescription>Personal contact details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Personal Email</p>
                                <p className="text-base">{about.personalEmail}</p>
                            </div>
                            {about?.address && (
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Address
                                    </p>
                                    <p className="text-base whitespace-pre-wrap">{about.address}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Emergency Contact Card */}
            {about?.emergencyContact && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Emergency Contact
                        </CardTitle>
                        <CardDescription>Emergency contact information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Name</p>
                                <p className="text-base">{about.emergencyContact.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Relationship</p>
                                <p className="text-base">{about.emergencyContact.relationship || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Phone</p>
                                <p className="text-base">{about.emergencyContact.phone || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
