export enum Role {
  CITIZEN = 'CITIZEN',
  TRAINEE = 'TRAINEE',
  MEDICAL_EXAMINER = 'MEDICAL_EXAMINER',
  POLICE_OFFICER = 'POLICE_OFFICER',
  PATROL_OFFICER = 'PATROL_OFFICER',
  DETECTIVE = 'DETECTIVE',
  SERGEANT = 'SERGEANT',
  CAPTAIN = 'CAPTAIN',
  POLICE_CHIEF = 'POLICE_CHIEF',
}

export enum CaseStatus {
  PENDING = 'PENDING',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  AWAITING_TRIAL = 'AWAITING_TRIAL',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum CrimeLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

export interface Evidence {
  id: number;
  evidence_number: string;
  case: number;
  description: string;
  file: string;
  evidence_type: 'BIOLOGICAL' | 'DOCUMENT' | 'IMAGE' | 'AUDIO';
  is_verified: boolean;
  uploaded_by_detail: User;
  uploaded_at: string;
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  RETURNED = 'RETURNED',
  SENT_TO_OFFICER = 'SENT_TO_OFFICER',
  VOID = 'VOID',
  APPROVED = 'APPROVED',
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: Role;
  role_display: string;
  badge_number: string | null;
  phone_number: string | null;
  is_active: boolean;
  date_joined: string;
  created_at: string;
  last_login?: string;
}

export interface Witness {
  name: string;
  phone: string;
  national_id: string;
}

export interface CrimeScene {
  id: number;
  location: string;
  description: string;
  occurred_at: string;
  discovered_at: string;
  witnesses_info: Witness[];
  weather_conditions?: string;
  lighting_conditions?: string;
}

export interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  crime_level: CrimeLevel;
  crime_level_display: string;
  status: CaseStatus;
  status_display: string;
  plaintiffs_info: any[];
  assigned_to: number | null;
  assigned_to_detail: User | null;
  created_by: number | null;
  created_by_detail: User | null;
  reported_at: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  location: string | null;
  notes: string | null;
  is_closed: boolean;
  is_approved: boolean;
  crime_scene?: CrimeScene;
}

export interface Complaint {
  id: number;
  citizen: number;
  citizen_detail: { username: string; full_name: string };
  title: string;
  description: string;
  status: ComplaintStatus;
  status_display: string;
  rejection_count: number;
  trainee_feedback: string | null;
  updated_at: string;
  incident_date?: string;
  location?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}