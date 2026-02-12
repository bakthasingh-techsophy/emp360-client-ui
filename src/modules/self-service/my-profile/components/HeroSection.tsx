import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Building2, Briefcase } from 'lucide-react';
import { UserProfile } from '../types';

interface HeroSectionProps {
    profile: UserProfile;
}

export function HeroSection({ profile }: HeroSectionProps) {
    const { fullName, designation, department, location, profileImage, employeeId } = profile;

    return (
        <div className="relative w-full bg-card rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Profile Image with Edit Overlay */}
                <div className="relative group">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-md">
                        <AvatarImage src={profileImage} alt={fullName} />
                        <AvatarFallback className="text-2xl md:text-3xl font-bold bg-primary/10 text-primary">
                            {fullName.split(' ').map((n) => n[0]).join('')}
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
                            <span>Full-Time</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
