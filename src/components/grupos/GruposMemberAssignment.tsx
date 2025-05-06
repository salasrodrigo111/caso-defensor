
import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { User, Group } from '@/types';
import { addUserToGroup, removeUserFromGroup } from '@/services/supabase/groupsService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GruposMemberAssignmentProps {
  abogados: User[];
  grupos: Group[];
  onAssignmentComplete: () => void;
}

interface DraggableItemProps {
  id: string;
  name: string;
}

const DraggableItem = ({ id, name }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 bg-white rounded-md shadow border border-gray-200 cursor-grab flex items-center ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
      <span>{name}</span>
    </div>
  );
};

// Modificando DropZone para aceptar tanto User[] como string[]
interface DropZoneProps {
  id: string;
  nombre: string;
  members: User[] | string[];
  children: React.ReactNode;
}

const DropZone = ({ id, nombre, members, children }: DropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-md border-2 ${
        isOver ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300'
      }`}
    >
      <h3 className="font-medium mb-2">{nombre} ({Array.isArray(members) ? members.length : 0})</h3>
      <div className="min-h-[100px]">
        {children}
      </div>
    </div>
  );
};

export const GruposMemberAssignment = ({ abogados, grupos, onAssignmentComplete }: GruposMemberAssignmentProps) => {
  const { toast } = useToast();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, User[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Store the user being dragged for optimistic UI updates
  const [draggedUser, setDraggedUser] = useState<User | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragDestinationId, setDragDestinationId] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize available users and group members
    const initGroupMembers: Record<string, User[]> = {};
    const userGroups: Record<string, string[]> = {};
    
    // Initialize empty arrays for each group
    grupos.forEach(grupo => {
      initGroupMembers[grupo.id] = [];
    });
    
    // Place users in their respective groups based on grupo.members
    abogados.forEach(abogado => {
      const userGroupNames = abogado.groups || [];
      userGroups[abogado.id] = [];
      
      grupos.forEach(grupo => {
        if (grupo.members.includes(abogado.id) || userGroupNames.includes(grupo.name)) {
          initGroupMembers[grupo.id].push(abogado);
          userGroups[abogado.id].push(grupo.id);
        }
      });
    });
    
    // Users not in any group go to available users
    const available = abogados.filter(abogado => {
      return userGroups[abogado.id].length === 0;
    });
    
    setGroupMembers(initGroupMembers);
    setAvailableUsers(available);
  }, [abogados, grupos]);
  
  const handleDragStart = (event: DragStartEvent) => {
    const userId = event.active.id as string;
    setActiveId(userId);
    
    // Store the user being dragged
    const user = findUserById(userId);
    if (user) {
      setDraggedUser(user);
      
      // Store source container
      if (availableUsers.some(u => u.id === userId)) {
        setDragSourceId('available');
      } else {
        for (const groupId in groupMembers) {
          if (groupMembers[groupId].some(u => u.id === userId)) {
            setDragSourceId(groupId);
            break;
          }
        }
      }
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedUser) {
      setActiveId(null);
      setDraggedUser(null);
      setDragSourceId(null);
      setDragDestinationId(null);
      return;
    }
    
    const userId = active.id as string;
    const targetId = over.id as string;
    setDragDestinationId(targetId);
    
    // Validar que userId es un UUID válido
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    if (!isValidUUID) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ID de usuario inválido. Debe tener formato UUID.",
      });
      setActiveId(null);
      setDraggedUser(null);
      setDragSourceId(null);
      setDragDestinationId(null);
      return;
    }
    
    // Apply optimistic UI updates
    // These updates will happen immediately for better UX
    if (targetId === 'available' && dragSourceId !== 'available') {
      // Move from group to available
      if (dragSourceId) {
        // Update state optimistically
        setGroupMembers(prev => ({
          ...prev,
          [dragSourceId]: prev[dragSourceId].filter(u => u.id !== userId)
        }));
        setAvailableUsers(prev => [...prev, draggedUser]);
      }
    } else if (targetId !== 'available' && dragSourceId === 'available') {
      // Move from available to group
      // Update state optimistically
      setAvailableUsers(prev => prev.filter(u => u.id !== userId));
      setGroupMembers(prev => ({
        ...prev,
        [targetId]: [...prev[targetId], draggedUser]
      }));
    } else if (targetId !== 'available' && dragSourceId !== 'available' && targetId !== dragSourceId) {
      // Move from one group to another
      // Update state optimistically
      if (dragSourceId) {
        setGroupMembers(prev => ({
          ...prev,
          [dragSourceId]: prev[dragSourceId].filter(u => u.id !== userId),
          [targetId]: [...prev[targetId], draggedUser]
        }));
      }
    }
    
    // Now perform the actual API calls in the background
    try {
      setLoading(true);
      
      if (targetId === 'available' && dragSourceId !== 'available' && dragSourceId !== null) {
        // Remove user from group in database
        await removeUserFromGroup(dragSourceId, userId);
        
        toast({
          title: "Usuario removido",
          description: `${draggedUser.name} ha sido removido del grupo.`,
        });
      } else if (targetId !== 'available' && dragSourceId === 'available') {
        // Add user to group in database
        await addUserToGroup(targetId, userId);
        
        toast({
          title: "Usuario asignado",
          description: `${draggedUser.name} ha sido asignado al grupo.`,
        });
      } else if (targetId !== 'available' && dragSourceId !== 'available' && dragSourceId !== null && targetId !== dragSourceId) {
        // Move user between groups
        await removeUserFromGroup(dragSourceId, userId);
        await addUserToGroup(targetId, userId);
        
        toast({
          title: "Usuario transferido",
          description: `${draggedUser.name} ha sido transferido a otro grupo.`,
        });
      }
    } catch (error) {
      console.error('Error updating user group assignment:', error);
      
      // Revert optimistic updates on error
      // This would need a more complex state tracking mechanism
      // For now, we'll just show an error message
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la asignación del usuario. Por favor, inténtelo de nuevo.",
      });
      
      // Refresh the component state to match the server state
      const initGroupMembers: Record<string, User[]> = {};
      const userGroups: Record<string, string[]> = {};
      
      grupos.forEach(grupo => {
        initGroupMembers[grupo.id] = [];
      });
      
      abogados.forEach(abogado => {
        const userGroupNames = abogado.groups || [];
        userGroups[abogado.id] = [];
        
        grupos.forEach(grupo => {
          if (grupo.members.includes(abogado.id) || userGroupNames.includes(grupo.name)) {
            initGroupMembers[grupo.id].push(abogado);
            userGroups[abogado.id].push(grupo.id);
          }
        });
      });
      
      const available = abogados.filter(abogado => {
        return userGroups[abogado.id].length === 0;
      });
      
      setGroupMembers(initGroupMembers);
      setAvailableUsers(available);
    } finally {
      setLoading(false);
      setActiveId(null);
      setDraggedUser(null);
      setDragSourceId(null);
      setDragDestinationId(null);
    }
  };
  
  const findUserById = (userId: string): User | undefined => {
    if (availableUsers.some(u => u.id === userId)) {
      return availableUsers.find(u => u.id === userId);
    }
    
    for (const groupId in groupMembers) {
      const user = groupMembers[groupId].find(u => u.id === userId);
      if (user) return user;
    }
    
    return undefined;
  };
  
  const handleSaveChanges = () => {
    // All changes are already saved in real-time when dragging
    onAssignmentComplete();
    toast({
      title: "Cambios guardados",
      description: "Todos los cambios han sido guardados correctamente.",
    });
  };
  
  // Memoize rendered items to prevent unnecessary re-renders
  const renderAvailableUsers = useMemo(() => {
    return availableUsers.map(user => (
      <DraggableItem key={user.id} id={user.id} name={user.name} />
    ));
  }, [availableUsers]);
  
  const renderGroupUsers = useMemo(() => {
    const result: Record<string, JSX.Element[]> = {};
    
    for (const groupId in groupMembers) {
      result[groupId] = groupMembers[groupId].map(user => (
        <DraggableItem key={user.id} id={user.id} name={user.name} />
      ));
    }
    
    return result;
  }, [groupMembers]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Asignar Abogados a Grupos</h2>
        <Button onClick={handleSaveChanges} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Arrastra y suelta los abogados para asignarlos a diferentes grupos.
      </p>
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Abogados disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <DropZone id="available" nombre="Sin asignar" members={availableUsers}>
                {renderAvailableUsers}
                {availableUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay abogados disponibles
                  </p>
                )}
              </DropZone>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grupos.map(grupo => (
                <Card key={grupo.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{grupo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DropZone id={grupo.id} nombre="Miembros" members={groupMembers[grupo.id] || []}>
                      {renderGroupUsers[grupo.id]}
                      {(groupMembers[grupo.id] || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Arrastra abogados aquí
                        </p>
                      )}
                    </DropZone>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <DragOverlay>
          {activeId && draggedUser ? (
            <div className="p-3 bg-white rounded-md shadow border border-primary flex items-center">
              <UserIcon className="mr-2 h-4 w-4 text-primary" />
              <span>{draggedUser.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
