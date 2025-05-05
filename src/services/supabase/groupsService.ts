
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types';

export const getGroups = async (defensoria: string): Promise<Group[]> => {
  const { data, error } = await supabase
    .from('groups')
    .select('*, case_types(name)')
    .eq('defensoria', defensoria);

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  return data || [];
};

export const createGroup = async (group: Omit<Group, 'id'>): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
};

export const updateGroup = async (id: string, updates: Partial<Group>): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }

  return data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const addUserToGroup = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });

  if (error) {
    console.error('Error adding user to group:', error);
    throw error;
  }
};

export const removeUserFromGroup = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing user from group:', error);
    throw error;
  }
};

export const getGroupMembers = async (groupId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }

  return data?.map(item => item.user_id) || [];
};

export const assignGroupToCaseType = async (caseTypeId: string, groupId: string, defensoria: string): Promise<void> => {
  const { error } = await supabase
    .from('case_type_groups')
    .insert({
      case_type_id: caseTypeId,
      group_id: groupId,
      defensoria
    });

  if (error) {
    console.error('Error assigning group to case type:', error);
    throw error;
  }
};

export const activateGroupForCaseType = async (caseTypeId: string, groupId: string): Promise<void> => {
  // First, deactivate all groups for this case type
  const { error: deactivateError } = await supabase
    .from('case_type_groups')
    .update({ is_active: false })
    .eq('case_type_id', caseTypeId);

  if (deactivateError) {
    console.error('Error deactivating groups:', deactivateError);
    throw deactivateError;
  }

  // Then, activate the selected group
  const { error } = await supabase
    .from('case_type_groups')
    .update({ is_active: true })
    .eq('case_type_id', caseTypeId)
    .eq('group_id', groupId);

  if (error) {
    console.error('Error activating group:', error);
    throw error;
  }
};

export const getGroupsForCaseType = async (caseTypeId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('case_type_groups')
    .select('group_id, is_active, groups(name)')
    .eq('case_type_id', caseTypeId);

  if (error) {
    console.error('Error fetching groups for case type:', error);
    throw error;
  }

  return data || [];
};
