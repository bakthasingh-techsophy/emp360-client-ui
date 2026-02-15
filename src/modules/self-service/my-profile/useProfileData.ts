import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { UserProfile } from "./types";
import { MaritalStatus, Gender, EventType, DocumentType, UserDetailsSnapshot } from '../../user-management/types/onboarding.types';
import UniversalSearchRequest from "@/types/search";

const DUMMY_PROFILE: UserProfile = {
  id: "u1",
  employeeId: "EMP001",
  firstName: "Pavan",
  lastName: "Kola",
  fullName: "Pavan Kola",
  email: "pavan.kola@techsophy.com",
  phone: "+91 98765 43210",
  designation: "Senior Frontend Engineer",
  department: "Engineering",
  location: "Hyderabad, India",
  profileImage: "https://github.com/shadcn.png", // Placeholder
  about: {
    aboutMe:
      "Passionate frontend developer with 5+ years of experience in React and TypeScript. Loves building intuitive and accessible user interfaces.",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Ravi Kola",
      relationship: "Father",
      phone: "+91 99887 76655",
    },
    personalEmail: "pavan.kola.dev@gmail.com",
    address:
      "Flat 402, Sunshine Apartments, Hitech City, Hyderabad, Telangana - 500081",
  },
  personal: {
    firstName: "Pavan",
    lastName: "Kola",
    phone: "+91 98765 43210",
    personalEmail: "pavan.kola.dev@gmail.com",
    maritalStatus: MaritalStatus.SINGLE, // Fixed enum
    gender: Gender.MALE, // Fixed enum
    officialEmail: "pavan.kola@techsophy.com",
    createdAt: "2022-01-10T00:00:00Z",
  },
  job: {
    designationId: "Senior Frontend Engineer",
    departmentId: "Engineering",
    reportingManager: "Baktha Singh",
    joiningDate: "2022-01-10", // Corrected property name
    workLocationId: "Hyderabad", // Corrected property name
    officialEmail: "pavan.kola@techsophy.com",
    employeeTypeId: "FULL_TIME", // Example value
    createdAt: "2022-01-10T00:00:00Z",
  },
  timeline: [
    {
      employeeId: "EMP001",
      date: "2022-01-10",
      type: EventType.JOINING, // Fixed enum
      createdAt: "2022-01-10T00:00:00Z",
    },
    {
      employeeId: "EMP001",
      date: "2024-01-01",
      type: EventType.PROMOTION, // Fixed enum
      createdAt: "2024-01-01T00:00:00Z",
    },
  ],
  documents: [
    {
      employeeId: "EMP001",
      name: "Appointment Letter.pdf",
      type: DocumentType.FILE, // Fixed enum
      uploadedDate: "2022-01-10",
      fileName: "appointment_letter.pdf",
      createdAt: "2022-01-10T00:00:00Z",
      url: "#",
    },
    {
      employeeId: "EMP001",
      name: "Aadhaar Card.pdf",
      type: DocumentType.FILE, // Fixed enum
      uploadedDate: "2022-01-11",
      fileName: "aadhaar_card.pdf",
      createdAt: "2022-01-11T00:00:00Z",
      url: "#",
    },
  ],
  assets: [
    {
      id: "a1",
      name: "MacBook Pro M1",
      code: "ASM-MBP-001",
      issueDate: "2022-01-10",
      status: "Assigned",
    },
  ],
  finances: {
    salaryStructure: "Grade A - Senior Engineer",
    bankAccount: {
      bankName: "HDFC Bank",
      accountNumber: "XXXX-XXXX-4321",
      ifsc: "HDFC0001234",
    },
    pfAccount: "XXXX-XXXX-1234",
    uan: "100000001234",
    taxRegime: "New",
  },
  performance: [
    {
      id: "p1",
      period: "2023-2024",
      rating: 4.5,
      feedbackSummary:
        "Excellent performance in project delivery and mentoring juniors.",
      goalsStatus: "Completed",
    },
  ],
};

export function useProfileData() {
  const { user } = useAuth();
  const { refreshUserDetailsSnapshots } = useUserManagement();
  
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        if (!user?.id) {
          setError('User ID not available');
          setIsLoading(false);
          return;
        }

        // Search for current user's profile
        const searchRequest: UniversalSearchRequest = {
          idsList: [user.id],
        };

        const result = await refreshUserDetailsSnapshots(searchRequest, 0, 1);

        if (result?.content && result.content.length > 0) {
          const snapshot = result.content[0];
          const mappedProfile = mapSnapshotToProfile(snapshot);
          setProfile(mappedProfile);
          setError(null);
        } else {
          setError('Unable to load profile data');
          // Keep dummy profile as fallback
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load your profile');
        // Keep dummy profile as fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.id, refreshUserDetailsSnapshots]);

  // Map UserDetailsSnapshot to UserProfile
  const mapSnapshotToProfile = (snapshot: UserDetailsSnapshot): UserProfile => {
    return {
      id: snapshot.id,
      employeeId: snapshot.id,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      fullName: `${snapshot.firstName} ${snapshot.lastName}`,
      email: snapshot.email,
      phone: snapshot.phone,
      designation: snapshot.designation,
      department: snapshot.department,
      location: snapshot.workLocation,
      profileImage: "https://github.com/shadcn.png", // Placeholder
      about: {
        aboutMe: "",
        bloodGroup: "",
        emergencyContact: snapshot.emergencyContact ? {
          name: snapshot.emergencyContact.name,
          relationship: snapshot.emergencyContact.relation || "",
          phone: snapshot.emergencyContact.phone,
        } : {
          name: "",
          relationship: "",
          phone: "",
        },
        personalEmail: "",
        address: "",
      },
      personal: {
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        phone: snapshot.phone,
        personalEmail: "",
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        officialEmail: snapshot.email,
        createdAt: snapshot.createdAt,
      },
      job: {
        designationId: snapshot.designation,
        departmentId: snapshot.department,
        reportingManager: snapshot.reportingTo || "",
        joiningDate: snapshot.joiningDate,
        workLocationId: snapshot.workLocation,
        officialEmail: snapshot.email,
        employeeTypeId: snapshot.employeeType,
        createdAt: snapshot.createdAt,
      },
      timeline: [],
      documents: [],
      assets: [],
      finances: {
        salaryStructure: "",
        bankAccount: {
          bankName: "",
          accountNumber: "",
          ifsc: "",
        },
        pfAccount: "",
        uan: "",
        taxRegime: "New",
      },
      performance: [],
    };
  };

  const updateProfile = (section: keyof UserProfile, data: any) => {
    setProfile((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const updateNestedProfile = (
    section: keyof UserProfile,
    subSection: string,
    data: any
  ) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [subSection]: data,
      },
    }));
  };

  // Helper to update specific fields directly (for shallow sections)
  const updateField = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateProfilePicture = (newPicture: string) => {
    setProfile((prev) => ({
      ...prev,
      profileImage: newPicture,
    }));
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    updateField,
    updateNestedProfile,
    updateProfilePicture,
  };
}
