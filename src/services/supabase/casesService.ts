
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/types';

export const getCases = async (defensoria: string): Promise<Case[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*, case_types(name)')
    .eq('defensoria', defensoria);

  if (error) {
    console.error('Error fetching cases:', error);
    throw error;
  }

  return data || [];
};

export const createCase = async (caseData: Omit<Case, 'id'>): Promise<Case> => {
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single();

  if (error) {
    console.error('Error creating case:', error);
    throw error;
  }

  return data;
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

  return data;
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

  return data;
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

  return data || [];
};
