import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from '../types';
import { AboutTab } from './AboutTab';
import { ProfileTab } from './ProfileTab';
import { JobTab } from './JobTab';
import { TimelineTab } from './TimelineTab';
import { DocumentsTab } from './DocumentsTab';
import { AssetsTab } from './AssetsTab';
import { FinancesTab } from './FinancesTab';
import { PerformanceTab } from './PerformanceTab';
import { User, FileText, Briefcase, Clock, File, Monitor, DollarSign, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileTabsProps {
    profile: UserProfile;
}

export function ProfileTabs({ profile }: ProfileTabsProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [selectedTab, setSelectedTab] = useState('about');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    return (
        <Tabs defaultValue="about" value={selectedTab} onValueChange={handleTabChange} className="w-full">
            {isMobile ? (
                <div className="pb-2 mb-4">
                    <Select value={selectedTab} onValueChange={handleTabChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Tab" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="about">About</SelectItem>
                            <SelectItem value="profile">Profile</SelectItem>
                            <SelectItem value="job">Job</SelectItem>
                            <SelectItem value="timeline">Timeline</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="assets">Assets</SelectItem>
                            <SelectItem value="finances">Finances</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="overflow-x-auto pb-2 mb-4">
                    <TabsList className="w-full justify-start inline-flex h-auto p-1 bg-muted/50">
                        <TabsTrigger value="about" className="flex gap-2 items-center py-2">
                            <User className="w-4 h-4" /> About
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex gap-2 items-center py-2">
                            <FileText className="w-4 h-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="job" className="flex gap-2 items-center py-2">
                            <Briefcase className="w-4 h-4" /> Job
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex gap-2 items-center py-2">
                            <Clock className="w-4 h-4" /> Timeline
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex gap-2 items-center py-2">
                            <File className="w-4 h-4" /> Documents
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="flex gap-2 items-center py-2">
                            <Monitor className="w-4 h-4" /> Assets
                        </TabsTrigger>
                        <TabsTrigger value="finances" className="flex gap-2 items-center py-2">
                            <DollarSign className="w-4 h-4" /> Finances
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex gap-2 items-center py-2">
                            <BarChart2 className="w-4 h-4" /> Performance
                        </TabsTrigger>
                    </TabsList>
                </div>
            )}

            <div className="mt-4">
                <TabsContent value="about" className="mt-0">
                    <AboutTab profile={profile} />
                </TabsContent>
                <TabsContent value="profile" className="mt-0">
                    <ProfileTab profile={profile} />
                </TabsContent>
                <TabsContent value="job" className="mt-0">
                    <JobTab profile={profile} />
                </TabsContent>
                <TabsContent value="timeline" className="mt-0">
                    <TimelineTab profile={profile} />
                </TabsContent>
                <TabsContent value="documents" className="mt-0">
                    <DocumentsTab profile={profile} />
                </TabsContent>
                <TabsContent value="assets" className="mt-0">
                    <AssetsTab profile={profile} />
                </TabsContent>
                <TabsContent value="finances" className="mt-0">
                    <FinancesTab profile={profile} />
                </TabsContent>
                <TabsContent value="performance" className="mt-0">
                    <PerformanceTab profile={profile} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
