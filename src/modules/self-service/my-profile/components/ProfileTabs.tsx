import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AboutTab } from './AboutTab';
import { ProfileTab } from './ProfileTab';
import { JobTab } from './JobTab';
import { TimelineTab } from './TimelineTab';
import { DocumentsTab } from './DocumentsTab';
import { AssetsTab } from './AssetsTab';
import { FinancesTab } from './FinancesTab';
import { SkillsTab } from './SkillsTab';
import { EventHistoryTab } from './EventHistoryTab';
import { User, FileText, Briefcase, History, File, Lightbulb, DollarSign, Award, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileTabsProps {
    employeeId: string;
}

export function ProfileTabs({ employeeId }: ProfileTabsProps) {
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
                            <SelectItem value="profile">General Details</SelectItem>
                            <SelectItem value="job">Job Details</SelectItem>
                            <SelectItem value="timeline">Employment History</SelectItem>
                            <SelectItem value="skills">Skills & Certifications</SelectItem>
                            <SelectItem value="events">Event History</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="finances">Banking Details</SelectItem>
                            <SelectItem value="assets">Assets</SelectItem>
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
                            <FileText className="w-4 h-4" /> General Details
                        </TabsTrigger>
                        <TabsTrigger value="job" className="flex gap-2 items-center py-2">
                            <Briefcase className="w-4 h-4" /> Job Details
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex gap-2 items-center py-2">
                            <History className="w-4 h-4" /> Employment History
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="flex gap-2 items-center py-2">
                            <Award className="w-4 h-4" /> Skills
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex gap-2 items-center py-2">
                            <TrendingUp className="w-4 h-4" /> Events
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex gap-2 items-center py-2">
                            <File className="w-4 h-4" /> Documents
                        </TabsTrigger>
                        <TabsTrigger value="finances" className="flex gap-2 items-center py-2">
                            <DollarSign className="w-4 h-4" /> Banking
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="flex gap-2 items-center py-2">
                            <Lightbulb className="w-4 h-4" /> Assets
                        </TabsTrigger>
                    </TabsList>
                </div>
            )}

            <div className="mt-4">
                <TabsContent value="about" className="mt-0">
                    <AboutTab employeeId={employeeId} />
                </TabsContent>
                <TabsContent value="profile" className="mt-0">
                    <ProfileTab />
                </TabsContent>
                <TabsContent value="job" className="mt-0">
                    <JobTab employeeId={employeeId} />
                </TabsContent>
                <TabsContent value="timeline" className="mt-0">
                    <TimelineTab />
                </TabsContent>
                <TabsContent value="skills" className="mt-0">
                    <SkillsTab />
                </TabsContent>
                <TabsContent value="events" className="mt-0">
                    <EventHistoryTab />
                </TabsContent>
                <TabsContent value="documents" className="mt-0">
                    <DocumentsTab employeeId={employeeId} />
                </TabsContent>
                <TabsContent value="finances" className="mt-0">
                    <FinancesTab />
                </TabsContent>
                <TabsContent value="assets" className="mt-0">
                    <AssetsTab />
                </TabsContent>
            </div>
        </Tabs>
    );
}
