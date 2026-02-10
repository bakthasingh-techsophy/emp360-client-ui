import { useState } from "react";
import { UserProfile } from "./types";
import { MaritalStatus, Gender, EventType, DocumentType } from '../../user-management/types/onboarding.types';

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
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);

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
    updateProfile,
    updateField,
    updateNestedProfile,
    updateProfilePicture,
  };
}
