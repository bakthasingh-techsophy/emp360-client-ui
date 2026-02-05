/**
 * Employee View Modal
 * Displays comprehensive employee information
 * Custom fixed header (no default close icon) and fixed action bar at bottom
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  IdCard, 
  Building2, 
  Calendar, 
  CreditCard, 
  User, 
  Cake,
  Copy,
  Edit,
  X,
  Briefcase
} from 'lucide-react';
import { UserDetailsSnapshot } from '../types/onboarding.types';
import { useToast } from '@/hooks/use-toast';

interface EmployeeViewModalProps {
  employee: UserDetailsSnapshot | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (employee: UserDetailsSnapshot) => void;
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge variant="outline" className="px-3 py-1 pointer-events-none">
      {skill}
    </Badge>
  );
}

export function EmployeeViewModal({ employee, open, onClose, onEdit }: EmployeeViewModalProps) {
  if (!employee) return null;

  const { toast } = useToast();
  
  // Construct full name from firstName and lastName
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );

  const InfoRowWithCopy = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-start gap-1.5">
            <p className="text-sm font-medium break-words">{value}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 flex-shrink-0 -mt-0.5"
              onClick={handleCopy}
              title={`Copy ${label.toLowerCase()}`}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 flex flex-col" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-16 w-16 ring-2 ring-muted">
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-xl mb-1">{fullName}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(employee.status)} className="capitalize">
                    {employee.status}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {employee.designation}
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {employee.department}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Contact Information - Grid with light background */}
            <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRowWithCopy icon={Mail} label="Email Address" value={employee.email} />
                <InfoRowWithCopy icon={Phone} label="Phone Number" value={employee.phone} />
                <InfoRowWithCopy icon={IdCard} label="Employee ID" value={employee.id} />
                <InfoRow 
                  icon={User} 
                  label="Reporting To" 
                  value={employee.reportingTo || 'Not Assigned'} 
                />
                {employee.emergencyContact && (
                  <>
                    <InfoRowWithCopy 
                      icon={Phone} 
                      label="Emergency Contact" 
                      value={employee.emergencyContact.phone} 
                    />
                    <InfoRow 
                      icon={User} 
                      label="Emergency Contact Person" 
                      value={`${employee.emergencyContact.name} (${employee.emergencyContact.relation})`} 
                    />
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Job Details - Grid Layout */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow 
                  icon={Building2} 
                  label="Department" 
                  value={employee.department} 
                />
                <InfoRow 
                  icon={IdCard} 
                  label="Designation" 
                  value={employee.designation} 
                />
                <InfoRow 
                  icon={Briefcase} 
                  label="Role" 
                  value={employee.role.replace(/-/g, ' ')} 
                />
                {employee.location && (
                  <InfoRow 
                    icon={Building2} 
                    label="Work Location" 
                    value={employee.location} 
                  />
                )}
                <InfoRow 
                  icon={Calendar} 
                  label="Date of Joining" 
                  value={formatDate(employee.joiningDate)} 
                />
                {employee.dateOfBirth && (
                  <InfoRow 
                    icon={Cake} 
                    label="Date of Birth" 
                    value={formatDate(employee.dateOfBirth)} 
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Identity Documents - Compact Grid */}
            {(employee.panNumber || employee.aadharNumber) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Identity Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {employee.panNumber && (
                      <InfoRowWithCopy 
                        icon={CreditCard} 
                        label="PAN Number" 
                        value={employee.panNumber} 
                      />
                    )}
                    {employee.aadharNumber && (
                      <InfoRowWithCopy 
                        icon={CreditCard} 
                        label="Aadhar Number" 
                        value={employee.aadharNumber} 
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Skills - Flex Wrap Layout */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Skills & Expertise
              </h3>
              {employee.skills && employee.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <SkillBadge key={index} skill={skill} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Last updated: {employee.updatedAt ? formatDate(employee.updatedAt) : 'Recently'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(employee)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
