
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

export interface Defensoria {
  id: string;
  name: string;
  description?: string;
  mostradores: string[]; // User IDs with mostrador role
}
