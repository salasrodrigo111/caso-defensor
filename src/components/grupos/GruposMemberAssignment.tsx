
import React, { useState, useEffect } from 'react';
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

const DropZone = ({ id, nombre, members, children }: { id: string; nombre: string; members: User[] | string[]; children: React.ReactNode }) => {
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
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const userId = active.id as string;
    const targetId = over.id as string;
    
    // Don't do anything if dropped in the same container
    if (targetId === 'available') {
      // Move from group to available
      const user = findUserById(userId);
      if (!user) return;
      
      // Find which group the user is in
      for (const groupId in groupMembers) {
        if (groupMembers[groupId].some(u => u.id === userId)) {
          try {
            setLoading(true);
            // Remove user from the group in database
            await removeUserFromGroup(groupId, userId);
            
            // Update state
            setGroupMembers(prev => ({
              ...prev,
              [groupId]: prev[groupId].filter(u => u.id !== userId)
            }));
            setAvailableUsers(prev => [...prev, user]);
            
            toast({
              title: "Usuario removido",
              description: `${user.name} ha sido removido del grupo.`,
            });
          } catch (error) {
            console.error('Error removing user from group:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "No se pudo remover al usuario del grupo.",
            });
          } finally {
            setLoading(false);
          }
          break;
        }
      }
    } else if (targetId !== 'available') {
      // Move to a group
      const groupId = targetId;
      const user = findUserById(userId);
      if (!user) return;
      
      // Check if user is coming from available or another group
      const isFromAvailable = availableUsers.some(u => u.id === userId);
      
      if (isFromAvailable) {
        try {
          setLoading(true);
          // Add user to group in database
          await addUserToGroup(groupId, userId);
          
          // Update state
          setAvailableUsers(prev => prev.filter(u => u.id !== userId));
          setGroupMembers(prev => ({
            ...prev,
            [groupId]: [...prev[groupId], user]
          }));
          
          toast({
            title: "Usuario asignado",
            description: `${user.name} ha sido asignado al grupo.`,
          });
        } catch (error) {
          console.error('Error adding user to group:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo asignar al usuario al grupo.",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Find which group the user is in
        for (const srcGroupId in groupMembers) {
          if (groupMembers[srcGroupId].some(u => u.id === userId)) {
            if (srcGroupId === groupId) return; // Already in this group
            
            try {
              setLoading(true);
              // Remove from old group
              await removeUserFromGroup(srcGroupId, userId);
              // Add to new group
              await addUserToGroup(groupId, userId);
              
              // Update state
              setGroupMembers(prev => ({
                ...prev,
                [srcGroupId]: prev[srcGroupId].filter(u => u.id !== userId),
                [groupId]: [...prev[groupId], user]
              }));
              
              toast({
                title: "Usuario transferido",
                description: `${user.name} ha sido transferido a otro grupo.`,
              });
            } catch (error) {
              console.error('Error transferring user between groups:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo transferir al usuario entre grupos.",
              });
            } finally {
              setLoading(false);
            }
            break;
          }
        }
      }
    }
    
    setActiveId(null);
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
                {availableUsers.map(user => (
                  <DraggableItem key={user.id} id={user.id} name={user.name} />
                ))}
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
                      {(groupMembers[grupo.id] || []).map(user => (
                        <DraggableItem key={user.id} id={user.id} name={user.name} />
                      ))}
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
          {activeId ? (
            <div className="p-3 bg-white rounded-md shadow border border-primary flex items-center">
              <UserIcon className="mr-2 h-4 w-4 text-primary" />
              <span>{findUserById(activeId)?.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
