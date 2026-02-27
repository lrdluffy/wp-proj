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

export enum EvidenceType {
  BIOLOGICAL = 'BIOLOGICAL',
  MEDICAL = 'MEDICAL',
  VEHICLE = 'VEHICLE',
  IDENTIFICATION = 'IDENTIFICATION',
  DOCUMENT = 'DOCUMENT',
  PHOTOGRAPH = 'PHOTOGRAPH',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FINGERPRINT = 'FINGERPRINT',
  DNA = 'DNA',
  WEAPON = 'WEAPON',
  OTHER = 'OTHER',
}

export interface Evidence {
  id: number;
  evidence_number: string;
  case: number;
  evidence_type: EvidenceType;
  evidence_type_display: string;
  description: string;
  location_found: string | null;
  collected_at: string;
  status: string;
  status_display: string;
  photos: any[];
  documents: any[];
  collected_by_detail: User;

  vehicle_license_plate?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vin_number?: string | null;

  document_type?: string | null;
  document_number?: string | null;
  extra_details?: Record<string, any>;
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
  evidence_items?: Evidence[];
  trials?: Trial[];
}

export interface Suspect {
  id: number;
  case: number;
  case_detail?: Case;
  first_name: string;
  last_name: string;
  full_name: string;
  status: string;
  status_display: string;
  identified_by: number | null;
  identified_by_detail: User | null;
  identified_at: string | null;
  national_id?: string | null;
  phone_number?: string | null;
  arrest_date: string | null;
  is_in_custody: boolean;
  bail_amount?: string | null;
  bail_paid?: boolean;
  sergeant_probability?: number | null;
  sergeant_notes?: string | null;
  sergeant_officer?: number | null;
  sergeant_officer_detail?: User | null;
  sergeant_recorded_at?: string | null;
  detective_probability?: number | null;
  detective_notes?: string | null;
  detective_officer?: number | null;
  detective_officer_detail?: User | null;
  detective_recorded_at?: string | null;
  captain_probability?: number | null;
  captain_statement?: string | null;
  captain_officer?: number | null;
  captain_officer_detail?: User | null;
  captain_decided_at?: string | null;
  chief_approved?: boolean | null;
  chief_comment?: string | null;
  chief_officer?: number | null;
  chief_officer_detail?: User | null;
  chief_reviewed_at?: string | null;
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


export enum TrialStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  POSTPONED = 'POSTPONED',
}

export interface Trial {
  id: number;
  case: number;
  case_detail?: Case;
  suspect: number;
  suspect_detail?: Suspect;
  trial_number: string;
  status: TrialStatus;
  status_display: string;
  scheduled_date: string;
  court_name: string;
  verdict?: string;
  verdict_display?: string;
  sentence?: string;
  is_completed: boolean;
}