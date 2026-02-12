import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '../types';
import { Monitor, Laptop, Phone, Mouse } from 'lucide-react';

interface AssetsTabProps {
    profile: UserProfile;
}

export function AssetsTab({ profile }: AssetsTabProps) {
    const getAssetIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('macbook') || lowerName.includes('laptop')) return <Laptop className="w-4 h-4" />;
        if (lowerName.includes('monitor')) return <Monitor className="w-4 h-4" />;
        if (lowerName.includes('phone') || lowerName.includes('mobile')) return <Phone className="w-4 h-4" />;
        return <Mouse className="w-4 h-4" />;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Assigned': return 'default';
            case 'Returned': return 'secondary';
            case 'Damaged': return 'destructive';
            case 'Lost': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Assigned Assets</CardTitle>
                <CardDescription>
                    View IT assets and equipment currently assigned to you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset Name</TableHead>
                            <TableHead>Asset Code</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profile.assets.length > 0 ? (
                            profile.assets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {getAssetIcon(asset.name)}
                                        {asset.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{asset.code}</TableCell>
                                    <TableCell>{asset.issueDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(asset.status) as any}>
                                            {asset.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No assets assigned.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
