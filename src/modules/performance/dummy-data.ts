/**
 * Dummy Data for Performance Reviews Module
 * Includes mock templates, requests, and users
 */

import {
  PerformanceTemplate,
  PerformanceReviewRequest,
  MockUser,
  TemplateColumn,
  TemplateRow,
} from "./types";

// ============= MOCK USERS =============
export const mockUsers: MockUser[] = [
  {
    id: "emp-001",
    name: "Rahul Kumar",
    email: "rahul@emp360.com",
    role: "EMPLOYEE",
    department: "Engineering",
  },
  {
    id: "emp-002",
    name: "Priya Singh",
    email: "priya@emp360.com",
    role: "EMPLOYEE",
    department: "Marketing",
  },
  {
    id: "manager-001",
    name: "Arun Verma",
    email: "arun@emp360.com",
    role: "REPORTING_MANAGER",
    department: "Engineering",
  },
  {
    id: "manager-002",
    name: "Neha Patel",
    email: "neha@emp360.com",
    role: "REPORTING_MANAGER",
    department: "Marketing",
  },
  {
    id: "hr-001",
    name: "Vikram Singh",
    email: "vikram@emp360.com",
    role: "HR",
    department: "Human Resources",
  },
];

// ============= TEMPLATE COLUMNS =============
const engineeringColumns: TemplateColumn[] = [
  {
    id: "col-001",
    name: "Technical Skills",
    type: "RATING",
    editableBy: ["EMPLOYEE", "MANAGER"],
    mandatory: true,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 1,
  },
  {
    id: "col-002",
    name: "Communication",
    type: "RATING",
    editableBy: ["MANAGER"],
    mandatory: true,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 2,
  },
  {
    id: "col-003",
    name: "Teamwork",
    type: "RATING",
    editableBy: ["EMPLOYEE", "MANAGER"],
    mandatory: false,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 3,
  },
  {
    id: "col-004",
    name: "Final Score",
    type: "CALCULATED",
    editableBy: [],
    mandatory: false,
    calculationFormula: "avg(Technical Skills, Communication, Teamwork)",
    displayOrder: 4,
  },
  {
    id: "col-005",
    name: "Manager Notes",
    type: "TEXT",
    editableBy: ["MANAGER"],
    mandatory: false,
    displayOrder: 5,
  },
];

const marketingColumns: TemplateColumn[] = [
  {
    id: "col-101",
    name: "Campaign Performance",
    type: "RATING",
    editableBy: ["EMPLOYEE", "MANAGER"],
    mandatory: true,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 1,
  },
  {
    id: "col-102",
    name: "Creativity",
    type: "RATING",
    editableBy: ["MANAGER"],
    mandatory: true,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 2,
  },
  {
    id: "col-103",
    name: "Execution",
    type: "RATING",
    editableBy: ["EMPLOYEE", "MANAGER"],
    mandatory: true,
    ratingRange: { min: 1, max: 5 },
    displayOrder: 3,
  },
  {
    id: "col-104",
    name: "Overall Rating",
    type: "CALCULATED",
    editableBy: [],
    mandatory: false,
    calculationFormula: "avg(Campaign Performance, Creativity, Execution)",
    displayOrder: 4,
  },
];

// ============= TEMPLATE ROWS =============
const commonRows: TemplateRow[] = [
  {
    id: "row-001",
    label: "Q1 Performance",
    weightage: 25,
    displayOrder: 1,
  },
  {
    id: "row-002",
    label: "Q2 Performance",
    weightage: 25,
    displayOrder: 2,
  },
  {
    id: "row-003",
    label: "Q3 Performance",
    weightage: 25,
    displayOrder: 3,
  },
  {
    id: "row-004",
    label: "Q4 Performance",
    weightage: 25,
    displayOrder: 4,
  },
];

// ============= PERFORMANCE TEMPLATES =============
export const mockTemplates: PerformanceTemplate[] = [
  {
    id: "template-001",
    title: "Engineering Department - FY2026",
    description: "Annual performance review template for Engineering team",
    department: "Engineering",
    templateStatus: true,
    columns: engineeringColumns,
    rows: commonRows,
    createdBy: "hr-001",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-15T14:30:00Z",
  },
  {
    id: "template-002",
    title: "Marketing Department - FY2026",
    description: "Annual performance review template for Marketing team",
    department: "Marketing",
    templateStatus: true,
    columns: marketingColumns,
    rows: commonRows,
    createdBy: "hr-001",
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-01-15T14:30:00Z",
  },
];

// ============= PERFORMANCE REVIEW REQUESTS =============
export const mockRequests: PerformanceReviewRequest[] = [
  {
    id: "request-001",
    templateId: "template-001",
    employeeId: "emp-001",
    employeeName: "Rahul Kumar",
    managerId: "manager-001",
    managerName: "Arun Verma",
    department: "Engineering",
    status: "AT_EMPLOYEE",
    values: [
      { rowId: "row-001", columnId: "col-001", value: 4 },
      { rowId: "row-002", columnId: "col-001", value: 4 },
      { rowId: "row-003", columnId: "col-001", value: 3 },
      { rowId: "row-004", columnId: "col-001", value: 4 },
    ],
    finalScore: 0,
    updatedAt: "2026-02-10T10:30:00Z",
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "request-002",
    templateId: "template-001",
    employeeId: "emp-001",
    employeeName: "Rahul Kumar",
    managerId: "manager-001",
    managerName: "Arun Verma",
    department: "Engineering",
    status: "AT_MANAGER",
    values: [
      { rowId: "row-001", columnId: "col-001", value: 4, editedBy: "emp-001" },
      {
        rowId: "row-001",
        columnId: "col-002",
        value: 5,
        editedBy: "manager-001",
      },
      { rowId: "row-001", columnId: "col-003", value: 4, editedBy: "emp-001" },
      { rowId: "row-002", columnId: "col-001", value: 4, editedBy: "emp-001" },
      {
        rowId: "row-002",
        columnId: "col-002",
        value: 4,
        editedBy: "manager-001",
      },
      { rowId: "row-002", columnId: "col-003", value: 5, editedBy: "emp-001" },
    ],
    finalScore: 4.25,
    submittedByEmployeeAt: "2026-02-05T14:00:00Z",
    updatedAt: "2026-02-08T11:20:00Z",
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "request-003",
    templateId: "template-002",
    employeeId: "emp-002",
    employeeName: "Priya Singh",
    managerId: "manager-002",
    managerName: "Neha Patel",
    department: "Marketing",
    status: "AT_HR",
    values: [
      { rowId: "row-001", columnId: "col-101", value: 5, editedBy: "emp-002" },
      {
        rowId: "row-001",
        columnId: "col-102",
        value: 5,
        editedBy: "manager-002",
      },
      { rowId: "row-001", columnId: "col-103", value: 4, editedBy: "emp-002" },
    ],
    finalScore: 4.67,
    submittedByEmployeeAt: "2026-02-03T09:15:00Z",
    submittedByManagerAt: "2026-02-06T16:45:00Z",
    updatedAt: "2026-02-06T16:45:00Z",
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "request-004",
    templateId: "template-001",
    employeeId: "emp-001",
    employeeName: "Rahul Kumar",
    managerId: "manager-001",
    managerName: "Arun Verma",
    department: "Engineering",
    status: "FREEZED",
    values: [
      { rowId: "row-001", columnId: "col-001", value: 4, editedBy: "emp-001" },
      {
        rowId: "row-001",
        columnId: "col-002",
        value: 4,
        editedBy: "manager-001",
      },
      { rowId: "row-001", columnId: "col-003", value: 4, editedBy: "emp-001" },
    ],
    finalScore: 4.0,
    submittedByEmployeeAt: "2026-01-15T10:00:00Z",
    submittedByManagerAt: "2026-01-18T14:30:00Z",
    updatedAt: "2026-01-20T15:00:00Z",
    createdAt: "2026-01-10T08:00:00Z",
  },
];
