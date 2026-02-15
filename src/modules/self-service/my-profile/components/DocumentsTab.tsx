import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, File as FileIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { format } from 'date-fns';

interface DocumentsTabProps {
    employeeId: string;
}

interface Document {
    id?: string;
    name?: string;
    documentType?: string;
    type?: string;
    uploadDate?: string;
    uploadedDate?: string;
    createdAt?: string;
}

export function DocumentsTab({ employeeId }: DocumentsTabProps) {
    const { refreshDocuments } = useUserManagement();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load documents on mount
    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const result = await refreshDocuments({
                idsList: [employeeId],
            }, 0, 100);
            
            if (result?.content && Array.isArray(result.content)) {
                setDocuments(result.content);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [employeeId]);

    const getDocumentTypeColor = (docType?: string): string => {
        if (!docType) return 'bg-gray-50 text-gray-700';
        const type = docType.toLowerCase();
        if (type.includes('id') || type.includes('aadhar') || type.includes('passport')) 
            return 'bg-blue-50 text-blue-700 border-blue-200';
        if (type.includes('certificate') || type.includes('cert'))
            return 'bg-green-50 text-green-700 border-green-200';
        if (type.includes('contract') || type.includes('agreement'))
            return 'bg-purple-50 text-purple-700 border-purple-200';
        if (type.includes('education') || type.includes('degree'))
            return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getUploadDate = (doc: Document): string => {
        const date = doc.uploadDate || doc.uploadedDate || doc.createdAt;
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return date;
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-16" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileIcon className="w-5 h-5 text-primary" />
                    Documents
                </CardTitle>
                <CardDescription>
                    Your uploaded documents and certifications
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!documents || documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc, idx) => (
                            <div
                                key={doc.id || idx}
                                className="flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors group"
                            >
                                {/* Document Icon */}
                                <div className="flex-shrink-0">
                                    <div className="p-2.5 rounded-lg bg-primary/10">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                {/* Document Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-foreground truncate">
                                        {doc.name || 'Unnamed Document'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {(doc.documentType || doc.type) && (
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getDocumentTypeColor(doc.documentType || doc.type)}`}
                                            >
                                                {doc.documentType || doc.type}
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {getUploadDate(doc)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        title="View document"
                                        onClick={() => console.log('View document:', doc.id)}
                                    >
                                        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        title="Download document"
                                        onClick={() => console.log('Download document:', doc.id)}
                                    >
                                        <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
