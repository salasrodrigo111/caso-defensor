import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Case, CaseType } from '@/types';
import { getCases, assignCase, createCase, autoAssignCaseToRandomAvailableAbogado } from '@/services/supabase/casesService';
import { getUsersByDefensoriaAndRole } from '@/services/supabase/usersService';
import { getCaseTypes } from '@/services/supabase/caseTypesService';
import { getGroupsForCaseType } from '@/services/supabase/groupsService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const ExpedientesPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [expedientes, setExpedientes] = useState<Case[]>([]);
  const [allAbogados, setAllAbogados] = useState<any[]>([]);
  const [filteredAbogados, setFilteredAbogados] = useState<any[]>([]);
  const [tiposProceso, setTiposProceso] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReasignDialogOpen, setIsReasignDialogOpen] = useState(false);
  const [isNewExpedienteDialogOpen, setIsNewExpedienteDialogOpen] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Case | null>(null);
  const [selectedAbogado, setSelectedAbogado] = useState<string>('');
  const [newExpedienteData, setNewExpedienteData] = useState({
    caseNumber: '',
    caseTypeId: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.defensoria) {
          const [expedientesData, abogadosData, tiposData] = await Promise.all([
            getCases(currentUser.defensoria),
            getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado'),
            getCaseTypes(currentUser.defensoria)
          ]);
          
          setExpedientes(expedientesData);
          setAllAbogados(abogadosData.filter(a => a.active && !a.onLeave));
          setFilteredAbogados(abogadosData.filter(a => a.active && !a.onLeave));
          setTiposProceso(tiposData);
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
  
  const filterAbogadosByActiveGroup = async (caseTypeId: string) => {
    if (!caseTypeId || !currentUser?.defensoria) {
      setFilteredAbogados(allAbogados);
      return;
    }
    
    try {
      // Get groups for this case type
      const groups = await getGroupsForCaseType(caseTypeId);
      
      // Find the active group
      const activeGroup = groups.find(g => g.is_active);
      
      if (!activeGroup) {
        // If no active group, use all abogados
        setFilteredAbogados(allAbogados);
        return;
      }
      
      // Filter abogados that belong to the active group
      const groupMembers = allAbogados.filter(abogado => {
        // Check if the abogado's groups include the active group's name
        if (abogado.groups && abogado.groups.length > 0) {
          const groupNames = groups.map(g => g.groups.name);
          const abogadoGroupNames = abogado.groups;
          return abogadoGroupNames.some(name => groupNames.includes(name));
        }
        return false;
      });
      
      setFilteredAbogados(groupMembers.length > 0 ? groupMembers : allAbogados);
      
    } catch (error) {
      console.error('Error filtering abogados by group:', error);
      setFilteredAbogados(allAbogados);
    }
  };
  
  const handleReasignarClick = async (expediente: Case) => {
    setSelectedExpediente(expediente);
    setSelectedAbogado('');
    
    // Filter attorneys based on the case type's active group
    if (expediente.caseTypeId) {
      await filterAbogadosByActiveGroup(expediente.caseTypeId);
    } else {
      setFilteredAbogados(allAbogados);
    }
    
    setIsReasignDialogOpen(true);
  };
  
  const handleReasignar = async () => {
    if (!selectedExpediente || !selectedAbogado) return;
    
    try {
      await assignCase(selectedExpediente.id, selectedAbogado);
      
      // Actualizar la lista de expedientes
      if (currentUser?.defensoria) {
        const expedientesData = await getCases(currentUser.defensoria);
        setExpedientes(expedientesData);
      }
      
      toast({
        title: 'Expediente reasignado',
        description: `El expediente ha sido reasignado exitosamente.`,
      });
      
      setIsReasignDialogOpen(false);
    } catch (error) {
      console.error('Error reasignando expediente:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo reasignar el expediente. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const handleNuevoExpedienteClick = () => {
    setNewExpedienteData({
      caseNumber: '',
      caseTypeId: ''
    });
    setIsNewExpedienteDialogOpen(true);
  };
  
  const handleCreateExpediente = async () => {
    if (!currentUser?.defensoria) return;
    if (!newExpedienteData.caseNumber || !newExpedienteData.caseTypeId) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor complete todos los campos requeridos.',
      });
      return;
    }
    
    try {
      // Create the case without assigning it initially
      const newCase: Omit<Case, 'id'> = {
        caseNumber: newExpedienteData.caseNumber,
        caseTypeId: newExpedienteData.caseTypeId,
        defensoria: currentUser.defensoria,
        isTaken: false,
        createdAt: new Date()
      };
      
      // Create the case
      const createdCase = await createCase(newCase);
      
      // Auto-assign to a random available attorney from the active group
      await autoAssignCaseToRandomAvailableAbogado(createdCase.id, createdCase.caseTypeId, currentUser.defensoria);
      
      // Refresh the expedientes list
      const expedientesData = await getCases(currentUser.defensoria);
      setExpedientes(expedientesData);
      
      toast({
        title: 'Expediente creado',
        description: `El expediente ${newExpedienteData.caseNumber} ha sido creado y asignado automáticamente.`,
      });
      
      setIsNewExpedienteDialogOpen(false);
    } catch (error) {
      console.error('Error creando expediente:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el expediente. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const handleCaseTypeChange = async (caseTypeId: string) => {
    setNewExpedienteData(prev => ({ ...prev, caseTypeId }));
  };
  
  const columns = [
    { key: 'caseNumber', header: 'Número' },
    { 
      key: 'tipo',
      header: 'Tipo',
      cell: (row: Case) => {
        const tipoCase = tiposProceso.find(t => t.id === row.caseTypeId);
        return tipoCase ? tipoCase.name : 'Sin tipo'; 
      }
    },
    { 
      key: 'assignedToId',
      header: 'Asignado a',
      cell: (row: Case) => {
        const abogado = allAbogados.find(a => a.id === row.assignedToId);
        return abogado ? abogado.name : 'Sin asignar';
      } 
    },
    { key: 'createdAt', header: 'Fecha de ingreso', cell: (row: Case) => new Date(row.createdAt).toLocaleDateString() },
    { 
      key: 'estado',
      header: 'Estado',
      cell: (row: Case) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.isTaken ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.isTaken ? 'Tomado' : 'Pendiente'}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: Case) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ 
              title: "Ver expediente", 
              description: `Expediente ${row.caseNumber}` 
            })}
          >
            Ver
          </button>
          {!row.isTaken && (
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => handleReasignarClick(row)}
            >
              Reasignar
            </button>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Expedientes</h1>
        <p className="text-muted-foreground">
          Administre y reasigne los expedientes de su defensoría
        </p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expedientes</CardTitle>
              <CardDescription>
                Lista completa de expedientes de la defensoría
              </CardDescription>
            </div>
            <Button onClick={handleNuevoExpedienteClick}>
              Nuevo expediente
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable 
                data={expedientes}
                columns={columns}
                searchable={true}
                searchKeys={['caseNumber']}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog para reasignar expediente */}
      <Dialog open={isReasignDialogOpen} onOpenChange={setIsReasignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reasignar Expediente</DialogTitle>
            <DialogDescription>
              Seleccione un abogado para reasignar el expediente {selectedExpediente?.caseNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="abogado" className="text-sm font-medium">Abogado</label>
              <select
                id="abogado"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedAbogado}
                onChange={(e) => setSelectedAbogado(e.target.value)}
              >
                <option value="">Seleccione un abogado</option>
                {filteredAbogados.map((abogado) => (
                  <option key={abogado.id} value={abogado.id}>
                    {abogado.name}
                  </option>
                ))}
              </select>
              {filteredAbogados.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No hay abogados disponibles en el grupo activo. Considere activar otro grupo.
                </p>
              )}
              {filteredAbogados.length < allAbogados.length && (
                <p className="text-xs text-blue-600 mt-1">
                  Solo se muestran los abogados del grupo activo para este tipo de proceso.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReasignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReasignar} disabled={!selectedAbogado}>
              Reasignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para crear nuevo expediente */}
      <Dialog open={isNewExpedienteDialogOpen} onOpenChange={setIsNewExpedienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Expediente</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo expediente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="caseNumber" className="text-sm font-medium">Número de expediente</label>
              <Input
                id="caseNumber"
                value={newExpedienteData.caseNumber}
                onChange={(e) => setNewExpedienteData(prev => ({ ...prev, caseNumber: e.target.value }))}
                placeholder="Ej: 123/2023"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="caseTypeId" className="text-sm font-medium">Tipo de proceso</label>
              <select
                id="caseTypeId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newExpedienteData.caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
              >
                <option value="">Seleccione un tipo de proceso</option>
                {tiposProceso.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewExpedienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateExpediente}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ExpedientesPage;
