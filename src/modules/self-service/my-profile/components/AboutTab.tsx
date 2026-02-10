import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '../types';
import { Pencil, Save, X } from 'lucide-react';
import { useProfileData } from '../useProfileData';

interface AboutTabProps {
    profile: UserProfile;
}

export function AboutTab({ profile }: AboutTabProps) {
    const { updateNestedProfile, updateField } = useProfileData();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profile.about);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [name]: value,
            },
        }));
    };

    const handleSave = () => {
        updateField('about', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(profile.about);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>About Me</CardTitle>
                        <CardDescription>
                            A brief summary about yourself and your professional background.
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
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="aboutMe">Bio</Label>
                                <Textarea
                                    id="aboutMe"
                                    name="aboutMe"
                                    value={formData.aboutMe}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {profile.about.aboutMe || "No information added yet."}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Contact information and emergency details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Personal Email</Label>
                            {isEditing ? (
                                <Input
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="text-foreground font-medium">{profile.about.personalEmail}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            {isEditing ? (
                                <Input
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="text-foreground font-medium">{profile.about.bloodGroup}</div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Current Address</Label>
                            {isEditing ? (
                                <Textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={2}
                                />
                            ) : (
                                <div className="text-foreground font-medium">{profile.about.address}</div>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                            Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                {isEditing ? (
                                    <Input
                                        name="name"
                                        value={formData.emergencyContact.name}
                                        onChange={handleEmergencyContactChange}
                                    />
                                ) : (
                                    <div className="text-foreground font-medium">{profile.about.emergencyContact.name}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                {isEditing ? (
                                    <Input
                                        name="relationship"
                                        value={formData.emergencyContact.relationship}
                                        onChange={handleEmergencyContactChange}
                                    />
                                ) : (
                                    <div className="text-foreground font-medium">{profile.about.emergencyContact.relationship}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                {isEditing ? (
                                    <Input
                                        name="phone"
                                        value={formData.emergencyContact.phone}
                                        onChange={handleEmergencyContactChange}
                                    />
                                ) : (
                                    <div className="text-foreground font-medium">{profile.about.emergencyContact.phone}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
