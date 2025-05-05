
import { supabase } from '@/integrations/supabase/client';
import { CaseType } from '@/types';

export const getCaseTypes = async (defensoria: string): Promise<CaseType[]> => {
  const { data, error } = await supabase
    .from('case_types')
    .select('*')
    .eq('defensoria', defensoria);

  if (error) {
    console.error('Error fetching case types:', error);
    throw error;
  }

  return data || [];
};

export const createCaseType = async (caseType: Omit<CaseType, 'id'>): Promise<CaseType> => {
  const { data, error } = await supabase
    .from('case_types')
    .insert(caseType)
    .select()
    .single();

  if (error) {
    console.error('Error creating case type:', error);
    throw error;
  }

  return data;
};

export const updateCaseType = async (id: string, updates: Partial<CaseType>): Promise<CaseType> => {
  const { data, error } = await supabase
    .from('case_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case type:', error);
    throw error;
  }

  return data;
};

export const deleteCaseType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('case_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting case type:', error);
    throw error;
  }
};
