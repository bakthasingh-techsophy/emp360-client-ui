import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserProfile } from '../types';
import { Upload, FileText, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentsTabProps {
    profile: UserProfile;
}

export function DocumentsTab({ profile }: DocumentsTabProps) {
    const handleUpload = () => {
        toast.success("Document upload simulation successful!");
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>
                        Manage your personal and professional documents.
                    </CardDescription>
                </div>
                <Button size="sm" onClick={handleUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profile.documents.length > 0 ? (
                            profile.documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        {doc.name}
                                    </TableCell>
                                    <TableCell>{doc.type}</TableCell>
                                    <TableCell>{doc.uploadDate}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="View">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Download">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No documents found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
