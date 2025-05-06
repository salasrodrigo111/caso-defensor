import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CaseType, Group } from '@/types';
import { getCaseTypes, createCaseType, updateCaseType } from '@/services/supabase/caseTypesService';
import { getGroups, assignGroupToCaseType, activateGroupForCaseType, getGroupsForCaseType } from '@/services/supabase/groupsService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Users, UserX, Tooltip } from 'lucide-react';

const TiposProcesoPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tiposProceso, setTiposProceso] = useState<CaseType[]>([]);
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGruposDialogOpen, setIsGruposDialogOpen] = useState(false);
  const [selectedTipoProceso, setSelectedTipoProceso] = useState<CaseType | null>(null);
  const [gruposProceso, setGruposProceso] = useState<any[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [hoveredCaseType, setHoveredCaseType] = useState<string | null>(null);
  const [caseTypeGroups, setCaseTypeGroups] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.defensoria) {
          const tiposData = await getCaseTypes(currentUser.defensoria);
          setTiposProceso(tiposData);
          
          const gruposData = await getGroups(currentUser.defensoria);
          setGrupos(gruposData);
          
          // Fetch groups for each case type
          const groupsMap: Record<string, any[]> = {};
          await Promise.all(tiposData.map(async (tipo) => {
            try {
              const grupData = await getGroupsForCaseType(tipo.id);
              groupsMap[tipo.id] = grupData;
            } catch (error) {
              console.error(`Error fetching groups for case type ${tipo.id}:`, error);
              groupsMap[tipo.id] = [];
            }
          }));
          setCaseTypeGroups(groupsMap);
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
  
  const handleOpenDialog = (tipoProceso?: CaseType) => {
    if (tipoProceso) {
      setIsEditMode(true);
      setSelectedTipoProceso(tipoProceso);
      setFormData({
        name: tipoProceso.name,
        description: tipoProceso.description || ''
      });
    } else {
      setIsEditMode(false);
      setSelectedTipoProceso(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleOpenGruposDialog = async (tipoProceso: CaseType) => {
    setSelectedTipoProceso(tipoProceso);
    setSelectedGrupo('');
    
    try {
      const gruposData = await getGroupsForCaseType(tipoProceso.id);
      setGruposProceso(gruposData);
      setIsGruposDialogOpen(true);
    } catch (error) {
      console.error('Error fetching grupos for tipo proceso:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los grupos asignados.',
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentUser?.defensoria) return;
      
      const tipoProcesoData = {
        ...formData,
        defensoria: currentUser.defensoria
      };
      
      if (isEditMode && selectedTipoProceso) {
        await updateCaseType(selectedTipoProceso.id, tipoProcesoData);
        toast({
          title: 'Tipo de proceso actualizado',
          description: 'El tipo de proceso ha sido actualizado exitosamente.',
        });
      } else {
        await createCaseType(tipoProcesoData as Omit<CaseType, 'id'>);
        toast({
          title: 'Tipo de proceso creado',
          description: 'El tipo de proceso ha sido creado exitosamente.',
        });
      }
      
      // Reload tipos proceso
      const tiposData = await getCaseTypes(currentUser.defensoria);
      setTiposProceso(tiposData);
      
      // Reload groups for each case type
      const groupsMap: Record<string, any[]> = {};
      await Promise.all(tiposData.map(async (tipo) => {
        try {
          const grupData = await getGroupsForCaseType(tipo.id);
          groupsMap[tipo.id] = grupData;
        } catch (error) {
          console.error(`Error fetching groups for case type ${tipo.id}:`, error);
          groupsMap[tipo.id] = [];
        }
      }));
      setCaseTypeGroups(groupsMap);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving tipo proceso:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el tipo de proceso. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const handleAssignGroup = async () => {
    if (!selectedTipoProceso || !selectedGrupo || !currentUser?.defensoria) return;
    
    try {
      await assignGroupToCaseType(selectedTipoProceso.id, selectedGrupo, currentUser.defensoria);
      
      const gruposData = await getGroupsForCaseType(selectedTipoProceso.id);
      setGruposProceso(gruposData);
      
      // Update caseTypeGroups state
      setCaseTypeGroups(prev => ({
        ...prev,
        [selectedTipoProceso.id]: gruposData
      }));
      
      setSelectedGrupo('');
      toast({
        title: 'Grupo asignado',
        description: 'El grupo ha sido asignado al tipo de proceso exitosamente.',
      });
    } catch (error) {
      console.error('Error assigning group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo asignar el grupo. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const handleActivateGroup = async (groupId: string) => {
    if (!selectedTipoProceso) return;
    
    try {
      await activateGroupForCaseType(selectedTipoProceso.id, groupId);
      
      const gruposData = await getGroupsForCaseType(selectedTipoProceso.id);
      setGruposProceso(gruposData);
      
      // Update caseTypeGroups state
      setCaseTypeGroups(prev => ({
        ...prev,
        [selectedTipoProceso.id]: gruposData
      }));
      
      toast({
        title: 'Grupo activado',
        description: 'El grupo ha sido activado para este tipo de proceso.',
      });
    } catch (error) {
      console.error('Error activating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo activar el grupo. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const renderGroupIcon = (caseType: CaseType) => {
    const groups = caseTypeGroups[caseType.id] || [];
    const hasGroups = groups.length > 0;
    
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setHoveredCaseType(caseType.id)}
        onMouseLeave={() => setHoveredCaseType(null)}
      >
        {hasGroups ? (
          <Users size={20} className="text-blue-600" />
        ) : (
          <UserX size={20} className="text-gray-400" />
        )}
        
        {hoveredCaseType === caseType.id && hasGroups && (
          <div className="absolute z-50 w-48 p-2 mt-1 bg-white rounded-md shadow-lg border border-gray-200">
            <p className="font-medium text-sm mb-1">Grupos asignados:</p>
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.group_id} className="text-sm flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${group.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {group.groups.name}
                  {group.is_active && <span className="ml-1 text-xs text-green-500">(activo)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
    { 
      key: 'groups',
      header: 'Grupos',
      cell: (row: CaseType) => renderGroupIcon(row),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleOpenDialog(row)}
          >
            Editar
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleOpenGruposDialog(row)}
          >
            Grupos
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tipos de Procesos</h1>
        <p className="text-muted-foreground">
          Administre los tipos de procesos para asignación de expedientes
        </p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tipos de Procesos</CardTitle>
              <CardDescription>
                Lista de tipos de procesos de la defensoría
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              Nuevo tipo de proceso
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable 
                data={tiposProceso}
                columns={columns}
                searchable={true}
                searchKeys={['name', 'description']}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Tipo de Proceso' : 'Nuevo Tipo de Proceso'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Actualice la información del tipo de proceso seleccionado.'
                : 'Complete la información para crear un nuevo tipo de proceso.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nombre</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGruposDialogOpen} onOpenChange={setIsGruposDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grupos para {selectedTipoProceso?.name}</DialogTitle>
            <DialogDescription>
              Asigne hasta 2 grupos a este tipo de proceso y active uno.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {gruposProceso.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Grupos asignados:</p>
                <ul className="space-y-2">
                  {gruposProceso.map(grupo => (
                    <li key={grupo.group_id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{grupo.groups.name}</span>
                      <div className="flex space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${grupo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {grupo.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {!grupo.is_active && (
                          <button
                            type="button"
                            onClick={() => handleActivateGroup(grupo.group_id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay grupos asignados a este tipo de proceso.</p>
            )}
            
            {gruposProceso.length < 2 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="grupo" className="text-sm font-medium">Asignar grupo</label>
                  <select
                    id="grupo"
                    value={selectedGrupo}
                    onChange={(e) => setSelectedGrupo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar grupo</option>
                    {grupos
                      .filter(grupo => !gruposProceso.some(gp => gp.group_id === grupo.id))
                      .map(grupo => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <Button
                  onClick={handleAssignGroup}
                  disabled={!selectedGrupo}
                  className="w-full"
                >
                  Asignar grupo
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => setIsGruposDialogOpen(false)}
              className="w-full mt-2"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TiposProcesoPage;
