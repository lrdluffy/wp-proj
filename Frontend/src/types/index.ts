export enum Role {
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
  
  export enum ComplaintStatus {
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    CASE_CREATED = 'CASE_CREATED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
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
  
  export interface Case {
    id: number;
    case_number: string;
    title: string;
    description: string;
    crime_level: CrimeLevel;
    crime_level_display: string;
    status: CaseStatus;
    status_display: string;
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
  }
  
  export interface Complaint {
    id: number;
    complaint_number: string;
    complainant_name: string;
    complainant_phone: string;
    complainant_email: string | null;
    complainant_address: string | null;
    subject: string;
    description: string;
    incident_date: string;
    incident_location: string;
    status: ComplaintStatus;
    status_display?: string;
    related_case: number | null;
    received_by: number | null;
    reviewed_by: number | null;
    review_notes: string | null;
    created_at: string;
    updated_at: string;
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