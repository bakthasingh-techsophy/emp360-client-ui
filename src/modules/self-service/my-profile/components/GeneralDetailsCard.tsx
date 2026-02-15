/**
 * General Details Display Card for Self-Service Profile
 * View-only display of personal information from GeneralDetailsForm
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelfService } from "@/contexts/SelfServiceContext";
import { GeneralDetailsSnapshot } from "@/modules/user-management/types/onboarding.types";

export function GeneralDetailsCard() {
  const { getGeneralDetailsSelfService } = useSelfService();
  const [generalDetails, setGeneralDetails] = useState<GeneralDetailsSnapshot | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getGeneralDetailsSelfService();
    if (data) {
      setGeneralDetails(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generalDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No general details found</p>
        </CardContent>
      </Card>
    );
  }

  const CopyableField = ({
    label,
    value,
    icon: Icon,
    id,
  }: {
    label: string;
    value?: string;
    icon?: any;
    id: string;
  }) => (
    <div className="space-y-1 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      </div>
      <div className="flex items-center gap-2 font-medium text-sm">
        <span className="truncate">{value || "-"}</span>
        {value && (
          <button
            onClick={() => handleCopy(value, id)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Copy to clipboard"
          >
            {copiedId === id ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const PlainField = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="text-sm font-medium">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle>General Details</CardTitle>
        <CardDescription>
          Personal, identity, and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlainField label="First Name" value={generalDetails.firstName} />
          <PlainField label="Last Name" value={generalDetails.lastName} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Gender
            </label>
            <Badge variant="outline" className="mt-1 w-fit">
              {generalDetails.gender}
            </Badge>
          </div>

          <CopyableField label="Email" value={generalDetails.email} id="email" />
          <CopyableField label="Phone" value={generalDetails.phone} id="phone" />
          <CopyableField
            label="Secondary Phone"
            value={generalDetails.secondaryPhone || ""}
            id="secondary-phone"
          />

          <CopyableField
            label="Personal Email"
            value={generalDetails.personalEmail || ""}
            id="personal-email"
          />
          <PlainField
            label="Blood Group"
            value={generalDetails.bloodGroup}
          />
          <PlainField
            label="Marital Status"
            value={generalDetails.maritalStatus}
          />
          <PlainField
            label="Nationality"
            value={generalDetails.nationality || "-"}
          />
        </div>

        {/* Identity Documents Section */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Identity Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CopyableField
              label="PAN Number"
              value={generalDetails.panNumber}
              id="pan"
            />
            <CopyableField
              label="Aadhar Number"
              value={generalDetails.aadharNumber}
              id="aadhar"
            />
            <PlainField
              label="Passport Number"
              value={generalDetails.passportNumber || "-"}
            />
            <PlainField
              label="Passport Expiry"
              value={generalDetails.passportExpiry || "-"}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-1 group">
              <label className="text-sm font-medium text-muted-foreground">
                Contact Address
              </label>
              <div className="flex gap-2">
                <p className="text-sm font-medium whitespace-pre-wrap flex-1">
                  {generalDetails.contactAddress || "-"}
                </p>
                {generalDetails.contactAddress && (
                  <button
                    onClick={() =>
                      handleCopy(generalDetails.contactAddress || "", "contact-addr")
                    }
                    className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedId === "contact-addr" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1 group">
              <label className="text-sm font-medium text-muted-foreground">
                Permanent Address
              </label>
              <div className="flex gap-2">
                <p className="text-sm font-medium whitespace-pre-wrap flex-1">
                  {generalDetails.permanentAddress || "-"}
                </p>
                {generalDetails.permanentAddress && (
                  <button
                    onClick={() =>
                      handleCopy(generalDetails.permanentAddress || "", "permanent-addr")
                    }
                    className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedId === "permanent-addr" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        {generalDetails.emergencyContacts &&
          generalDetails.emergencyContacts.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                {generalDetails.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <PlainField label="Name" value={contact.name} />
                      <PlainField label="Relation" value={contact.relation} />
                      <CopyableField
                        label="Phone"
                        value={contact.phone}
                        id={`emergency-phone-${idx}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
