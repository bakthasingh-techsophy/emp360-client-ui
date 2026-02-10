import { UserDetails, JobDetailsCarrier, GeneralDetailsCarrier, DocumentItemCarrier, EventHistoryItemCarrier } from '../../user-management/types/onboarding.types';

export interface UserProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  profileImage: string;
  about: AboutDetails;
  personal: GeneralDetailsCarrier; // Updated to use GeneralDetailsCarrier
  job: JobDetailsCarrier; // Updated to use JobDetailsCarrier
  timeline: EventHistoryItemCarrier[]; // Updated to use EventHistoryItemCarrier
  documents: DocumentItemCarrier[]; // Updated to use DocumentItemCarrier
  assets: AssetItem[];
  finances: FinanceDetails;
  performance: PerformanceReview[];
}

export interface AboutDetails {
  aboutMe: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  personalEmail: string;
  address: string;
}

export interface AssetItem {
  id: string;
  name: string;
  code: string;
  issueDate: string;
  status: "Assigned" | "Returned" | "Damaged" | "Lost";
}

export interface FinanceDetails {
  salaryStructure: string; // Description or Link
  bankAccount: {
    bankName: string;
    accountNumber: string; // Masked
    ifsc: string;
  };
  pfAccount: string; // Masked
  uan: string; // Masked
  taxRegime: "Old" | "New";
}

export interface PerformanceReview {
  id: string;
  period: string;
  rating: number; // 1-5
  feedbackSummary: string;
  goalsStatus: "On Track" | "At Risk" | "Completed" | "Delayed";
}
