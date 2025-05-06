
import { supabase } from '@/integrations/supabase/client';
import { Case, SupabaseCase } from '@/types';
import { getUsersByDefensoriaAndRole } from './usersService';
import { getGroupsForCaseType } from './groupsService';

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
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*, case_types(name)')
      .eq('defensoria', defensoria);

    if (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }

    return (data as SupabaseCase[] || []).map(mapSupabaseCaseToCase);
  } catch (error) {
    console.error("Error al obtener casos:", error);
    return [];
  }
};

export const createCase = async (caseData: Omit<Case, 'id'>): Promise<Case> => {
  try {
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
  } catch (error) {
    console.error("Error al crear caso:", error);
    throw error;
  }
};

/**
 * Get an array of available attorneys from the active group for a specific case type
 */
export const getAvailableAttorneysFromActiveGroup = async (caseTypeId: string, defensoria: string): Promise<any[]> => {
  try {
    // Get all attorneys for the defensoria
    const allAttorneys = await getUsersByDefensoriaAndRole(defensoria, 'abogado');
    
    // Filter out attorneys who are not active or on leave
    const availableAttorneys = allAttorneys.filter(attorney => attorney.active && !attorney.onLeave);
    
    if (availableAttorneys.length === 0) {
      return [];
    }
    
    // Get groups for this case type
    const groups = await getGroupsForCaseType(caseTypeId);
    
    // Find the active group
    const activeGroup = groups.find(g => g.is_active);
    
    if (!activeGroup) {
      // If no active group, return all available attorneys
      return availableAttorneys;
    }
    
    // Filter attorneys that belong to the active group
    const groupMembers = availableAttorneys.filter(attorney => {
      // Check if the attorney's groups include the active group's name
      if (attorney.groups && attorney.groups.length > 0) {
        const groupNames = groups.map(g => g.groups.name);
        const attorneyGroupNames = attorney.groups;
        return attorneyGroupNames.some(name => groupNames.includes(name));
      }
      return false;
    });
    
    return groupMembers.length > 0 ? groupMembers : availableAttorneys;
    
  } catch (error) {
    console.error('Error getting available attorneys:', error);
    return [];
  }
};

/**
 * Auto-assign a case to a random available attorney from the active group
 */
export const autoAssignCaseToRandomAvailableAbogado = async (
  caseId: string, 
  caseTypeId: string, 
  defensoria: string
): Promise<Case | null> => {
  try {
    // Get available attorneys from the active group
    const availableAttorneys = await getAvailableAttorneysFromActiveGroup(caseTypeId, defensoria);
    
    if (availableAttorneys.length === 0) {
      console.log('No available attorneys to assign case');
      return null;
    }
    
    // Get all cases assigned to these attorneys to determine who has the fewest assignments
    const attorneyIds = availableAttorneys.map(a => a.id);
    
    // Get assigned cases for each attorney
    const assignedCasesPromises = attorneyIds.map(id => getAssignedCases(id));
    const assignedCasesResults = await Promise.all(assignedCasesPromises);
    
    // Count how many cases each attorney has
    const attorneyCaseCounts = attorneyIds.map((id, index) => ({
      id,
      count: assignedCasesResults[index].length
    }));
    
    // Sort by case count (lowest first)
    attorneyCaseCounts.sort((a, b) => a.count - b.count);
    
    // If there are attorneys with the same lowest count, choose randomly among them
    const lowestCount = attorneyCaseCounts[0].count;
    const attorneysWithLowestCount = attorneyCaseCounts.filter(a => a.count === lowestCount);
    
    // Choose a random attorney from those with the lowest count
    const randomIndex = Math.floor(Math.random() * attorneysWithLowestCount.length);
    const selectedAttorneyId = attorneysWithLowestCount[randomIndex].id;
    
    // Assign the case to the selected attorney
    return await assignCase(caseId, selectedAttorneyId);
    
  } catch (error) {
    console.error('Error auto-assigning case:', error);
    return null;
  }
};

export const assignCase = async (id: string, userId: string): Promise<Case> => {
  try {
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
  } catch (error) {
    console.error(`Error asignando caso ${id} al usuario ${userId}:`, error);
    throw error;
  }
};

export const takeCase = async (id: string, userId: string): Promise<Case> => {
  try {
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
  } catch (error) {
    console.error(`Error tomando caso ${id} por usuario ${userId}:`, error);
    throw error;
  }
};

export const getAssignedCases = async (userId: string): Promise<Case[]> => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*, case_types(name)')
      .eq('assigned_to_id', userId);

    if (error) {
      console.error('Error fetching assigned cases:', error);
      throw error;
    }

    return (data as SupabaseCase[] || []).map(mapSupabaseCaseToCase);
  } catch (error) {
    console.error(`Error obteniendo casos asignados al usuario ${userId}:`, error);
    return [];
  }
};
