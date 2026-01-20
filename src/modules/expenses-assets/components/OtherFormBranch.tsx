/**
 * Other Form Branch Component
 * Branch form for generic intimations (non-travel)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface OtherFormBranchProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtherFormBranch({ value, onChange }: OtherFormBranchProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Intimation Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide details about your intimation request
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="description">
              <FileText className="h-4 w-4 inline mr-2" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and details of this intimation..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide comprehensive details about your intimation request
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
