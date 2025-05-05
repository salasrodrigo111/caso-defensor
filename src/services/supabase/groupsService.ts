
import { supabase } from '@/integrations/supabase/client';
import { Group, SupabaseGroup, GroupMember, SupabaseGroupMember } from '@/types';

// Función auxiliar para convertir un grupo de Supabase a nuestro tipo Group
const mapSupabaseGroupToGroup = async (supabaseGroup: SupabaseGroup): Promise<Group> => {
  const members = await getGroupMembers(supabaseGroup.id);
  
  return {
    id: supabaseGroup.id,
    name: supabaseGroup.name,
    caseTypeId: supabaseGroup.case_type_id || '',
    isActive: supabaseGroup.is_active || false,
    defensoria: supabaseGroup.defensoria,
    members: members
  };
};

export const getGroups = async (defensoria: string): Promise<Group[]> => {
  const { data, error } = await supabase
    .from('groups')
    .select('*, case_types(name)')
    .eq('defensoria', defensoria);

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  // Convertir los datos de Supabase a nuestro tipo Group
  const groups: Group[] = [];
  for (const group of (data as SupabaseGroup[] || [])) {
    groups.push(await mapSupabaseGroupToGroup(group));
  }
  
  return groups;
};

export const createGroup = async (group: Omit<Group, 'id'>): Promise<Group> => {
  // Convertir de nuestro tipo a formato Supabase
  const supabaseGroupData = {
    name: group.name,
    case_type_id: group.caseTypeId,
    is_active: group.isActive,
    defensoria: group.defensoria
  };

  const { data, error } = await supabase
    .from('groups')
    .insert(supabaseGroupData)
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return mapSupabaseGroupToGroup(data as SupabaseGroup);
};

export const updateGroup = async (id: string, updates: Partial<Group>): Promise<Group> => {
  // Convertir de nuestro tipo a formato Supabase
  const supabaseUpdates: any = {};
  if (updates.name !== undefined) supabaseUpdates.name = updates.name;
  if (updates.caseTypeId !== undefined) supabaseUpdates.case_type_id = updates.caseTypeId;
  if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;
  if (updates.defensoria !== undefined) supabaseUpdates.defensoria = updates.defensoria;

  const { data, error } = await supabase
    .from('groups')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }

  return mapSupabaseGroupToGroup(data as SupabaseGroup);
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

// Nueva función para obtener los grupos a los que pertenece un usuario
export const getGroupsForUser = async (userId: string): Promise<Group[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  const groupIds = data.map(item => item.group_id);
  
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select('*, case_types(name)')
    .in('id', groupIds);

  if (groupsError) {
    console.error('Error fetching groups by ids:', groupsError);
    throw groupsError;
  }

  // Convertir los datos de Supabase a nuestro tipo Group
  const groups: Group[] = [];
  for (const group of (groupsData as SupabaseGroup[] || [])) {
    groups.push(await mapSupabaseGroupToGroup(group));
  }
  
  return groups;
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
