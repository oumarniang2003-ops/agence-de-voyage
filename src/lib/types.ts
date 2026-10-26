export type Role = "ADMIN" | "COUNSELOR" | "ASSISTANT" | "CLIENT";

export type ApplicationStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "ACCEPTED"
  | "VISA_GRANTED"
  | "VISA_REFUSED"
  | "CLOSED";

export type StepStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "BLOCKED";

export type DocumentStatus =
  | "MISSING"
  | "UPLOADED"
  | "IN_REVIEW"
  | "VALIDATED"
  | "REJECTED"
  | "EXPIRED";

export interface CurrentUserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  agencyCurrency: string;
}
