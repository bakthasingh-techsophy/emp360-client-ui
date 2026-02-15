/**
 * Assets Tab - Coming Soon
 * Asset assignment feature coming in future updates
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface AssetsTabProps {
    // Props kept for compatibility
}

export function AssetsTab({}: AssetsTabProps) {
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Asset Management
                </CardTitle>
                <CardDescription>
                    View IT assets and equipment assigned to you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                        Coming Soon
                    </Badge>
                    <p className="text-center text-muted-foreground max-w-md">
                        Asset management features will be available soon. Check back later for updates on your IT equipment and asset assignments.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
