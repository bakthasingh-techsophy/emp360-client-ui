import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '../types';
import { Pencil, Save, X } from 'lucide-react';
import { useProfileData } from '../useProfileData';

interface ProfileTabProps {
    profile: UserProfile;
}

export function ProfileTab({ profile }: ProfileTabProps) {
    const { updateField } = useProfileData();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profile.personal);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        updateField('personal', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(profile.personal);
        setIsEditing(false);
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Identity & Personal Details</CardTitle>
                    <CardDescription>
                        Manage your personal information and identity documents.
                    </CardDescription>
                </div>
                {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {isEditing ? (
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.firstName}</div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        {isEditing ? (
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.lastName}</div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.phone}</div>
                        )}
                    </div>

                    {/* Alternate Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="alternatePhone">Alternate Phone</Label>
                        {isEditing ? (
                            <Input
                                id="alternatePhone"
                                name="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.alternatePhone}</div>
                        )}
                    </div>

                    {/* Email - Read Only usually but editable here as per dummy requirements */}
                    <div className="space-y-2">
                        <Label htmlFor="personalEmail">Personal Email</Label>
                        {isEditing ? (
                            <Input
                                id="personalEmail"
                                name="personalEmail"
                                value={formData.personalEmail}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.personalEmail}</div>
                        )}
                    </div>

                    {/* DOB */}
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        {isEditing ? (
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.dob}</div>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        {isEditing ? (
                            <Select
                                name="gender"
                                value={formData.gender}
                                onValueChange={(value) => handleSelectChange('gender', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.gender}</div>
                        )}
                    </div>

                    {/* Marital Status */}
                    <div className="space-y-2">
                        <Label htmlFor="maritalStatus">Marital Status</Label>
                        {isEditing ? (
                            <Select
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-foreground font-medium">{profile.personal.maritalStatus}</div>
                        )}
                    </div>

                    {/* Aadhaar - Masked */}
                    <div className="space-y-2">
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        {isEditing ? (
                            <Input
                                id="aadhaar"
                                name="aadhaar"
                                value={formData.aadhaar}
                                onChange={handleInputChange}
                                placeholder="XXXX-XXXX-XXXX"
                            />
                        ) : (
                            <div className="text-foreground font-medium font-mono">{profile.personal.aadhaar}</div>
                        )}
                    </div>

                    {/* PAN - Masked */}
                    <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number</Label>
                        {isEditing ? (
                            <Input
                                id="pan"
                                name="pan"
                                value={formData.pan}
                                onChange={handleInputChange}
                                placeholder="XXXXX1234X"
                            />
                        ) : (
                            <div className="text-foreground font-medium font-mono">{profile.personal.pan}</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
