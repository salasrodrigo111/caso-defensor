import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Case } from '@/types';
import { getCases, assignCase } from '@/services/supabase/casesService';
import { getUsersByDefensoriaAndRole } from '@/services/supabase/usersService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ExpedientesPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [expedientes, setExpedientes] = useState<Case[]>([]);
  const [abogados, setAbogados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReasignDialogOpen, setIsReasignDialogOpen] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Case | null>(null);
  const [selectedAbogado, setSelectedAbogado] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.defensoria) {
          const expedientesData = await getCases(currentUser.defensoria);
          setExpedientes(expedientesData);
          
          const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
          setAbogados(abogadosData.filter(a => a.active && !a.onLeave));
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
  
  const handleReasignarClick = (expediente: Case) => {
    setSelectedExpediente(expediente);
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
  
  const columns = [
    { key: 'caseNumber', header: 'Número' },
    { 
      key: 'tipo',
      header: 'Tipo',
      cell: (row: Case) => {
        // Aquí necesitamos acceder al nombre del tipo de caso
        // Esto deberá ser adaptado según cómo esté estructurada la respuesta
        return 'Sin tipo'; // Esto debe ser actualizado para mostrar el tipo real
      }
    },
    { 
      key: 'assignedToId',
      header: 'Asignado a',
      cell: (row: Case) => {
        const abogado = abogados.find(a => a.id === row.assignedToId);
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
            <Button 
              onClick={() => toast({ 
                title: "Función no implementada", 
                description: "Esta funcionalidad será implementada próximamente" 
              })}
            >
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
                {abogados.map((abogado) => (
                  <option key={abogado.id} value={abogado.id}>
                    {abogado.name}
                  </option>
                ))}
              </select>
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
    </DashboardLayout>
  );
};

export default ExpedientesPage;
