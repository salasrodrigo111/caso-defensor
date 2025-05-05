
export type UserRole = 'administrador' | 'defensor' | 'mostrador' | 'abogado';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  defensoria?: string;
  groups?: string[];
  active: boolean;
  onLeave?: boolean;
  leaveEndDate?: Date;
}

export interface CaseType {
  id: string;
  name: string;
  description?: string;
  defensoria: string;
}

export interface Group {
  id: string;
  name: string;
  caseTypeId: string;
  isActive: boolean;
  defensoria: string;
  members: string[]; // User IDs
}

// Adaptar para que coincida con lo que devuelve Supabase
export interface SupabaseGroup {
  id: string;
  name: string;
  case_type_id: string | null;
  is_active: boolean | null;
  defensoria: string;
  case_types?: { name: string };
}

export interface Case {
  id: string;
  caseNumber: string;
  caseTypeId: string;
  assignedToId?: string;
  assignedAt?: Date;
  isTaken: boolean;
  takenAt?: Date;
  defensoria: string;
  createdAt: Date;
}

// Adaptar para que coincida con lo que devuelve Supabase
export interface SupabaseCase {
  id: string;
  case_number: string;
  case_type_id: string | null;
  assigned_to_id: string | null;
  assigned_at: string | null;
  is_taken: boolean | null;
  taken_at: string | null;
  defensoria: string;
  created_at: string;
  case_types?: { name: string };
}

export interface Defensoria {
  id: string;
  name: string;
  description?: string;
  mostradores: string[]; // User IDs with mostrador role
}
