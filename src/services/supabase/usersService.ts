
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

// Obtener usuarios por defensoría y rol
export const getUsersByDefensoriaAndRole = async (defensoria: string, role: string): Promise<User[]> => {
  // En un sistema real, esta función debería consultar a una tabla de usuarios en Supabase
  // Por ahora, utilizaremos datos de ejemplo
  
  // Mock data - en una implementación real esto vendría de la base de datos
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'abogado1@defensoria.gob',
      name: 'Abogado Pérez',
      role: 'abogado',
      defensoria: defensoria,
      active: true,
    },
    {
      id: '2',
      email: 'abogado2@defensoria.gob',
      name: 'Abogada García',
      role: 'abogado',
      defensoria: defensoria,
      active: true,
      onLeave: true,
      leaveEndDate: new Date('2023-08-15'),
    },
    {
      id: '3',
      email: 'abogado3@defensoria.gob',
      name: 'Abogado Rodríguez',
      role: 'abogado',
      defensoria: defensoria,
      active: false,
    },
  ];

  return mockUsers.filter(user => user.defensoria === defensoria && user.role === role);
};

// Actualizar disponibilidad del usuario
export const updateUserAvailability = async (userId: string, isOnLeave: boolean, leaveEndDate?: Date): Promise<User> => {
  // En un sistema real, esta función actualizaría un usuario en Supabase
  // Por ahora, simulamos la actualización
  console.log(`Usuario ${userId} actualizado: onLeave=${isOnLeave}, leaveEndDate=${leaveEndDate}`);
  
  // Mock de retorno - en una implementación real esto vendría de la base de datos
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
};

// Crear un nuevo usuario
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  // En un sistema real, esta función crearía un usuario en Supabase
  // Por ahora, simulamos la creación
  console.log('Creando usuario:', userData);
  
  // Mock de retorno - en una implementación real esto vendría de la base de datos
  return {
    id: 'new-user-id',
    ...userData,
  };
};
