
import { supabase } from '@/integrations/supabase/client';
import { User, Group } from '@/types';
import { getGroupsForUser } from './groupsService';

// Mock users data - since there's no users table in Supabase schema yet
const mockUsers: Record<string, User> = {
  '123e4567-e89b-12d3-a456-426614174000': {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'abogado1@defensoria.gob',
    name: 'Abogado Pérez',
    role: 'abogado',
    defensoria: 'def-1',
    active: true,
    groups: []
  },
  '223e4567-e89b-12d3-a456-426614174001': {
    id: '223e4567-e89b-12d3-a456-426614174001',
    email: 'abogado2@defensoria.gob',
    name: 'Abogada García',
    role: 'abogado',
    defensoria: 'def-1',
    active: true,
    onLeave: true,
    leaveEndDate: new Date('2023-08-15'),
    groups: []
  },
  '323e4567-e89b-12d3-a456-426614174002': {
    id: '323e4567-e89b-12d3-a456-426614174002',
    email: 'abogado3@defensoria.gob',
    name: 'Abogado Rodríguez',
    role: 'abogado',
    defensoria: 'def-1',
    active: false,
    groups: []
  }
};

// Get all users from a defensoria with a specific role
export const getUsersByDefensoriaAndRole = async (defensoria: string, role: string): Promise<User[]> => {
  try {
    // Since we don't have a users table in Supabase, we'll use mock data
    console.log(`Getting users for defensoria ${defensoria} with role ${role}`);
    
    // Filter mock users based on defensoria and role
    const filteredUsers = Object.values(mockUsers).filter(
      user => user.defensoria === defensoria && user.role === role
    );
    
    // Add groups to each user
    const usersWithGroups = await Promise.all(
      filteredUsers.map(async user => {
        try {
          const groups = await getGroupsForUser(user.id);
          return {
            ...user,
            groups: groups.map(group => group.name)
          };
        } catch (error) {
          console.log(`Error getting groups for user ${user.id}:`, error);
          return {
            ...user,
            groups: []
          };
        }
      })
    );
    
    return usersWithGroups;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Update user availability
export const updateUserAvailability = async (userId: string, isOnLeave: boolean, leaveEndDate?: Date): Promise<User> => {
  try {
    // Since we don't have a users table in Supabase yet, we'll update our mock data
    console.log(`Updating user ${userId}: onLeave=${isOnLeave}, leaveEndDate=${leaveEndDate}`);
    
    if (!mockUsers[userId]) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Update the mock user
    mockUsers[userId] = {
      ...mockUsers[userId],
      onLeave: isOnLeave,
      leaveEndDate
    };
    
    return mockUsers[userId];
  } catch (error) {
    console.error(`Error updating user availability for ${userId}:`, error);
    
    // If user doesn't exist in mock data, create a new entry
    if (!mockUsers[userId]) {
      mockUsers[userId] = {
        id: userId,
        email: 'usuario@defensoria.gob',
        name: 'Usuario Actualizado',
        role: 'abogado',
        defensoria: 'def-1',
        active: true,
        onLeave: isOnLeave,
        leaveEndDate,
        groups: []
      };
    }
    
    return mockUsers[userId];
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    // Generate a new UUID for the user
    const newUserId = crypto.randomUUID();
    console.log('Creating user with ID:', newUserId, userData);
    
    // Create the new user in our mock data
    const newUser: User = {
      id: newUserId,
      ...userData,
      groups: []
    };
    
    // Add to mock data
    mockUsers[newUserId] = newUser;
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Generate a new UUID if needed
    const fallbackId = crypto.randomUUID();
    
    // Create a fallback user
    const fallbackUser: User = {
      id: fallbackId,
      ...userData,
      groups: []
    };
    
    // Add to mock data
    mockUsers[fallbackId] = fallbackUser;
    
    return fallbackUser;
  }
};
