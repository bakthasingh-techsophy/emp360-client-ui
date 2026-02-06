import { create } from "zustand";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
}

export interface ParentProject {
  id: string;
  name: string;
  client: string; // Changed from code to client
}

export type ProjectNature = "Internal" | "External";
export type ProjectCategory = "Service" | "Product";
export type BillingType = "Billable" | "Non-Billable";

export interface SubProject {
  id: string;
  projectName: string;
  projectCode: string;
  client: string; // Should be auto-populated from parent if applicable
  revenue: number;
  projectNature: ProjectNature;
  category: ProjectCategory;
  billingType: BillingType;
  managerId: string;
  type: string;
  parentProjectId: string;
}

export interface Allocation {
  employeeId: string;
  subProjectId: string;
  allocation: number; // 0.0 to 1.0
}

// --------------------------------------------------
// MOCK DATA
// --------------------------------------------------

const MOCK_USERS: User[] = [
  { id: "u1", name: "Alice Admin", role: "ADMIN", email: "alice@emp360.com" },
  { id: "u2", name: "Bob Manager", role: "MANAGER", email: "bob@emp360.com" },
  {
    id: "u3",
    name: "Charlie Manager",
    role: "MANAGER",
    email: "charlie@emp360.com",
  },
  {
    id: "u4",
    name: "Dave Developer",
    role: "EMPLOYEE",
    email: "dave@emp360.com",
  },
  { id: "u5", name: "Eve Engineer", role: "EMPLOYEE", email: "eve@emp360.com" },
  {
    id: "u6",
    name: "Frank Frontend",
    role: "EMPLOYEE",
    email: "frank@emp360.com",
  },
  {
    id: "u7",
    name: "Grace Designer",
    role: "EMPLOYEE",
    email: "grace@emp360.com",
  },
  { id: "u8", name: "Heidi HR", role: "EMPLOYEE", email: "heidi@emp360.com" },
  { id: "u9", name: "Ivan Intern", role: "EMPLOYEE", email: "ivan@emp360.com" },
  {
    id: "u10",
    name: "Judy Junior",
    role: "EMPLOYEE",
    email: "judy@emp360.com",
  },
  { id: "u11", name: "Kevin QA", role: "EMPLOYEE", email: "kevin@emp360.com" },
  { id: "u12", name: "Liam Lead", role: "MANAGER", email: "liam@emp360.com" },
];

const MOCK_PARENT_PROJECTS: ParentProject[] = [
  { id: "p1", name: "Cloud Migration", client: "Enterprise Corp" },
  { id: "p2", name: "AI Platform", client: "Tech Giants Inc" },
  { id: "p3", name: "Mobile App Refresh", client: "Retail Kings" },
  { id: "p4", name: "Data Warehouse", client: "Finance Bros" },
];

const MOCK_SUB_PROJECTS: SubProject[] = [
  {
    id: "sp1",
    projectName: "Backend API Revamp",
    projectCode: "CLD-MIG-001",
    client: "Enterprise Corp",
    revenue: 50000,
    projectNature: "Internal",
    category: "Service",
    billingType: "Non-Billable",
    managerId: "u2",
    type: "Development",
    parentProjectId: "p1",
  },
  {
    id: "sp2",
    projectName: "Frontend Dashboard",
    projectCode: "CLD-MIG-002",
    client: "Enterprise Corp",
    revenue: 30000,
    projectNature: "Internal",
    category: "Product",
    billingType: "Non-Billable",
    managerId: "u2",
    type: "UI/UX",
    parentProjectId: "p1",
  },
  {
    id: "sp3",
    projectName: "Model Training",
    projectCode: "AI-PLT-001",
    client: "Tech Giants Inc",
    revenue: 150000,
    projectNature: "External",
    category: "Product",
    billingType: "Billable",
    managerId: "u3",
    type: "Research",
    parentProjectId: "p2",
  },
  {
    id: "sp4",
    projectName: "iOS App V2",
    projectCode: "MOB-REF-001",
    client: "Retail Kings",
    revenue: 80000,
    projectNature: "External",
    category: "Service",
    billingType: "Billable",
    managerId: "u12",
    type: "Mobile",
    parentProjectId: "p3",
  },
  {
    id: "sp5",
    projectName: "Android App V2",
    projectCode: "MOB-REF-002",
    client: "Retail Kings",
    revenue: 75000,
    projectNature: "External",
    category: "Service",
    billingType: "Billable",
    managerId: "u12",
    type: "Mobile",
    parentProjectId: "p3",
  },
];

const MOCK_ALLOCATIONS: Allocation[] = [
  { employeeId: "u4", subProjectId: "sp1", allocation: 0.5 },
  { employeeId: "u4", subProjectId: "sp2", allocation: 0.5 },
  { employeeId: "u5", subProjectId: "sp3", allocation: 1.0 },
  { employeeId: "u6", subProjectId: "sp1", allocation: 0.2 },
  { employeeId: "u7", subProjectId: "sp4", allocation: 0.8 },
  { employeeId: "u8", subProjectId: "sp5", allocation: 0.5 },
  { employeeId: "u9", subProjectId: "sp5", allocation: 0.5 },
  { employeeId: "u10", subProjectId: "sp3", allocation: 1.0 },
  { employeeId: "u11", subProjectId: "sp1", allocation: 0.3 },
  { employeeId: "u11", subProjectId: "sp2", allocation: 0.7 },
];

// --------------------------------------------------
// STORE
// --------------------------------------------------

interface ProjectState {
  currentUser: User;
  users: User[];
  parentProjects: ParentProject[];
  subProjects: SubProject[];
  allocations: Allocation[];

  // Actions
  switchRole: (userId: string) => void;
  createParentProject: (project: Omit<ParentProject, "id">) => void;
  updateParentProject: (id: string, project: Omit<ParentProject, "id">) => void;
  createSubProject: (project: Omit<SubProject, "id">) => void;
  updateSubProject: (id: string, project: Omit<SubProject, "id">) => void;
  updateAllocation: (
    employeeId: string,
    subProjectId: string,
    allocation: number,
  ) => void;
  bulkUpdateAllocations: (newAllocations: Allocation[]) => void;
  removeAllocation: (employeeId: string, subProjectId: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentUser: MOCK_USERS[0], // Default to Admin
  users: MOCK_USERS,
  parentProjects: MOCK_PARENT_PROJECTS,
  subProjects: MOCK_SUB_PROJECTS,
  allocations: MOCK_ALLOCATIONS,

  switchRole: (userId) =>
    set((state) => ({
      currentUser:
        state.users.find((u) => u.id === userId) || state.currentUser,
    })),

  createParentProject: (project) =>
    set((state) => ({
      parentProjects: [
        ...state.parentProjects,
        { ...project, id: `p${Date.now()}` },
      ],
    })),

  updateParentProject: (id, project) =>
    set((state) => ({
      parentProjects: state.parentProjects.map((p) =>
        p.id === id ? { ...p, ...project } : p,
      ),
    })),

  createSubProject: (project) =>
    set((state) => ({
      subProjects: [
        ...state.subProjects,
        { ...project, id: `sp${Date.now()}` },
      ],
    })),

  updateSubProject: (id, project) =>
    set((state) => ({
      subProjects: state.subProjects.map((p) =>
        p.id === id ? { ...p, ...project } : p,
      ),
    })),

  updateAllocation: (employeeId, subProjectId, allocation) =>
    set((state) => {
      const existingIndex = state.allocations.findIndex(
        (a) => a.employeeId === employeeId && a.subProjectId === subProjectId,
      );

      let newAllocations = [...state.allocations];

      if (existingIndex >= 0) {
        if (allocation <= 0) {
          // Remove if 0
          newAllocations.splice(existingIndex, 1);
        } else {
          newAllocations[existingIndex] = {
            ...newAllocations[existingIndex],
            allocation,
          };
        }
      } else if (allocation > 0) {
        newAllocations.push({ employeeId, subProjectId, allocation });
      }

      return { allocations: newAllocations };
    }),

  bulkUpdateAllocations: (newAllocations) =>
    set((state) => {
      // Merge allocations. If entry exists, update. If not, add.
      // Note: This simplistic merge assumes valid inputs.

      // Strategy: Filter out allocations for the target subprojects/employees being updated to avoid duplicates?
      // Or just iterate and update/push.

      let currentAllocations = [...state.allocations];

      newAllocations.forEach((newItem) => {
        const existingIndex = currentAllocations.findIndex(
          (a) =>
            a.employeeId === newItem.employeeId &&
            a.subProjectId === newItem.subProjectId,
        );

        if (existingIndex >= 0) {
          if (newItem.allocation <= 0) {
            currentAllocations.splice(existingIndex, 1);
          } else {
            currentAllocations[existingIndex] = newItem;
          }
        } else if (newItem.allocation > 0) {
          currentAllocations.push(newItem);
        }
      });

      return { allocations: currentAllocations };
    }),

  removeAllocation: (employeeId, subProjectId) =>
    set((state) => ({
      allocations: state.allocations.filter(
        (a) =>
          !(a.employeeId === employeeId && a.subProjectId === subProjectId),
      ),
    })),
}));
