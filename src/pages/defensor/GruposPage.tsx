import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Group, CaseType } from '@/types';
import { getGroups, createGroup, updateGroup } from '@/services/supabase/groupsService';
import { getCaseTypes } from '@/services/supabase/caseTypesService';
import { getUsersByDefensoriaAndRole } from '@/services/supabase/usersService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const GruposPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [tiposProceso, setTiposProceso] = useState<CaseType[]>([]);
  const [abogados, setAbogados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    caseTypeId: '',
    isActive: true
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.defensoria) {
          const gruposData = await getGroups(currentUser.defensoria);
          setGrupos(gruposData);
          
          const tiposData = await getCaseTypes(currentUser.defensoria);
          setTiposProceso(tiposData);
          
          const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
          setAbogados(abogadosData.filter(a => a.active));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos. Por favor, inténtelo de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, toast]);
  
  const handleOpenDialog = (grupo?: Group) => {
    if (grupo) {
      setIsEditing(true);
      setSelectedGroup(grupo);
      setFormData({
        name: grupo.name,
        caseTypeId: grupo.caseTypeId || '',
        isActive: grupo.isActive || true
      });
    } else {
      setIsEditing(false);
      setSelectedGroup(null);
      setFormData({
        name: '',
        caseTypeId: '',
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentUser?.defensoria) return;
      
      const groupData = {
        name: formData.name,
        caseTypeId: formData.caseTypeId,
        isActive: formData.isActive,
        defensoria: currentUser.defensoria,
        members: [] // Inicialmente sin miembros
      };
      
      if (isEditing && selectedGroup) {
        await updateGroup(selectedGroup.id, groupData);
        toast({
          title: 'Grupo actualizado',
          description: 'El grupo ha sido actualizado exitosamente.',
        });
      } else {
        await createGroup(groupData);
        toast({
          title: 'Grupo creado',
          description: 'El grupo ha sido creado exitosamente.',
        });
      }
      
      // Reload groups
      const gruposData = await getGroups(currentUser.defensoria);
      setGrupos(gruposData);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el grupo. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const toggleGroupStatus = async (group: Group) => {
    try {
      await updateGroup(group.id, { isActive: !group.isActive });
      
      if (currentUser?.defensoria) {
        const gruposData = await getGroups(currentUser.defensoria);
        setGrupos(gruposData);
      }
      
      toast({
        title: group.isActive ? 'Grupo desactivado' : 'Grupo activado',
        description: `El grupo ha sido ${group.isActive ? 'desactivado' : 'activado'} exitosamente.`,
      });
    } catch (error) {
      console.error('Error updating group status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado del grupo. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const columns = [
    { key: 'name', header: 'Nombre' },
    { 
      key: 'caseTypeId', 
      header: 'Tipo de Proceso',
      cell: (row: Group) => {
        const caseType = tiposProceso.find(ct => ct.id === row.caseTypeId);
        return caseType ? caseType.name : 'No asignado';
      }
    },
    { 
      key: 'members', 
      header: 'Miembros', 
      cell: (row: Group) => row.members ? row.members.length : '0' 
    },
    { 
      key: 'isActive',
      header: 'Estado',
      cell: (row: Group) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: Group) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toggleGroupStatus(row)}
          >
            {row.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleOpenDialog(row)}
          >
            Editar
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Grupos</h1>
        <p className="text-muted-foreground">
          Administre los grupos de trabajo para asignación de expedientes
        </p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Grupos</CardTitle>
              <CardDescription>
                Lista de grupos de trabajo por tipo de proceso
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              Nuevo grupo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable 
                data={grupos}
                columns={columns}
                searchable={true}
                searchKeys={['name']}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Actualice la información del grupo seleccionado.' 
                : 'Complete la información para crear un nuevo grupo.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nombre del grupo</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="caseTypeId" className="text-sm font-medium">Tipo de proceso</label>
              <select
                id="caseTypeId"
                name="caseTypeId"
                value={formData.caseTypeId}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccione un tipo de proceso</option>
                {tiposProceso.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Grupo activo
              </label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GruposPage;
