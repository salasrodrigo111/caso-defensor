
import { supabase } from '@/integrations/supabase/client';
import { Case, SupabaseCase } from '@/types';

// Función auxiliar para convertir un caso de Supabase a nuestro tipo Case
const mapSupabaseCaseToCase = (supabaseCase: SupabaseCase): Case => ({
  id: supabaseCase.id,
  caseNumber: supabaseCase.case_number,
  caseTypeId: supabaseCase.case_type_id || '',
  assignedToId: supabaseCase.assigned_to_id || undefined,
  assignedAt: supabaseCase.assigned_at ? new Date(supabaseCase.assigned_at) : undefined,
  isTaken: supabaseCase.is_taken || false,
  takenAt: supabaseCase.taken_at ? new Date(supabaseCase.taken_at) : undefined,
  defensoria: supabaseCase.defensoria,
  createdAt: new Date(supabaseCase.created_at)
});

export const getCases = async (defensoria: string): Promise<Case[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*, case_types(name)')
    .eq('defensoria', defensoria);

  if (error) {
    console.error('Error fetching cases:', error);
    throw error;
  }

  return (data as SupabaseCase[] || []).map(mapSupabaseCaseToCase);
};

export const createCase = async (caseData: Omit<Case, 'id'>): Promise<Case> => {
  // Convertir de nuestro tipo a formato Supabase
  const supabaseCaseData = {
    case_number: caseData.caseNumber,
    case_type_id: caseData.caseTypeId,
    assigned_to_id: caseData.assignedToId,
    assigned_at: caseData.assignedAt?.toISOString(),
    is_taken: caseData.isTaken,
    taken_at: caseData.takenAt?.toISOString(),
    defensoria: caseData.defensoria,
    created_at: caseData.createdAt.toISOString()
  };

  const { data, error } = await supabase
    .from('cases')
    .insert(supabaseCaseData)
    .select()
    .single();

  if (error) {
    console.error('Error creating case:', error);
    throw error;
  }

  return mapSupabaseCaseToCase(data as SupabaseCase);
};

export const assignCase = async (id: string, userId: string): Promise<Case> => {
  const { data, error } = await supabase
    .from('cases')
    .update({ 
      assigned_to_id: userId, 
      assigned_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('is_taken', false) // Solo puede reasignar si no ha sido tomado
    .select()
    .single();

  if (error) {
    console.error('Error assigning case:', error);
    throw error;
  }

  return mapSupabaseCaseToCase(data as SupabaseCase);
};

export const takeCase = async (id: string, userId: string): Promise<Case> => {
  const { data, error } = await supabase
    .from('cases')
    .update({ 
      is_taken: true, 
      taken_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('assigned_to_id', userId) // Solo puede tomar si está asignado a él
    .select()
    .single();

  if (error) {
    console.error('Error taking case:', error);
    throw error;
  }

  return mapSupabaseCaseToCase(data as SupabaseCase);
};

export const getAssignedCases = async (userId: string): Promise<Case[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*, case_types(name)')
    .eq('assigned_to_id', userId);

  if (error) {
    console.error('Error fetching assigned cases:', error);
    throw error;
  }

  return (data as SupabaseCase[] || []).map(mapSupabaseCaseToCase);
};
