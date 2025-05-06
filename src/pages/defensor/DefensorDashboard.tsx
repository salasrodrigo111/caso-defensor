
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const DefensorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showReasignarDialog, setShowReasignarDialog] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<any>(null);

  // Mock data
  const expedientes = [
    { id: 'exp-1', numero: '123456/2023', tipo: 'Civil', asignado: 'Abogado Pérez', fecha: '2023-05-01', tomado: true },
    { id: 'exp-2', numero: '789012/2023', tipo: 'Familia', asignado: 'Abogada García', fecha: '2023-05-02', tomado: false },
    { id: 'exp-3', numero: '345678/2023', tipo: 'Civil', asignado: 'Abogado Rodríguez', fecha: '2023-05-03', tomado: true },
    { id: 'exp-4', numero: '901234/2023', tipo: 'Laboral', asignado: null, fecha: '2023-05-04', tomado: false },
    { id: 'exp-5', numero: '567890/2023', tipo: 'Civil', asignado: 'Abogado Pérez', fecha: '2023-05-05', tomado: false },
  ];

  const grupos = [
    { id: 'grupo-1', nombre: 'Civil Grupo A', tipo: 'Civil', miembros: 3, activo: true },
    { id: 'grupo-2', nombre: 'Familia Grupo A', tipo: 'Familia', miembros: 2, activo: true },
    { id: 'grupo-3', nombre: 'Civil Grupo B', tipo: 'Civil', miembros: 4, activo: false },
    { id: 'grupo-4', nombre: 'Laboral Grupo A', tipo: 'Laboral', miembros: 2, activo: true },
  ];

  const abogados = [
    { id: 'abog-1', nombre: 'Abogado Pérez', email: 'perez@defensoria.gob', grupos: 'Civil Grupo A', disponible: true },
    { id: 'abog-2', nombre: 'Abogada García', email: 'garcia@defensoria.gob', grupos: 'Familia Grupo A', disponible: true },
    { id: 'abog-3', nombre: 'Abogado Rodríguez', email: 'rodriguez@defensoria.gob', grupos: 'Civil Grupo A, Laboral Grupo A', disponible: false },
    { id: 'abog-4', nombre: 'Abogada Martínez', email: 'martinez@defensoria.gob', grupos: 'Civil Grupo B', disponible: true },
  ];

  const handleVerExpediente = (expediente: any) => {
    toast({ 
      title: "Ver expediente", 
      description: `Expediente ${expediente.numero}` 
    });
    // En una implementación real, aquí se navegaría a la página de detalles del expediente
  };

  const handleReasignarClick = (expediente: any) => {
    setSelectedExpediente(expediente);
    setShowReasignarDialog(true);
  };

  const handleReasignarExpediente = () => {
    if (!selectedExpediente) return;

    toast({
      title: "Expediente reasignado", 
      description: `El expediente ${selectedExpediente.numero} ha sido reasignado exitosamente.` 
    });
    
    setShowReasignarDialog(false);
  };

  const handleActivarDesactivarGrupo = (grupo: any) => {
    toast({ 
      title: grupo.activo ? "Grupo desactivado" : "Grupo activado", 
      description: `El grupo ${grupo.nombre} ha sido ${grupo.activo ? "desactivado" : "activado"} exitosamente.` 
    });
    // En una implementación real, aquí se actualizaría el estado del grupo
  };

  const handleEditarGrupo = (grupo: any) => {
    toast({ 
      title: "Editar grupo", 
      description: `Edición del grupo ${grupo.nombre}` 
    });
    // En una implementación real, aquí se abriría un diálogo de edición
  };

  const handleGestionarDisponibilidad = (abogado: any) => {
    toast({ 
      title: abogado.disponible ? "Abogado marcado como ausente" : "Abogado marcado como disponible", 
      description: `El abogado ${abogado.nombre} ha sido marcado como ${abogado.disponible ? "ausente" : "disponible"}.` 
    });
    // En una implementación real, aquí se actualizaría la disponibilidad del abogado
  };

  const handleGestionarGrupos = (abogado: any) => {
    toast({ 
      title: "Gestionar grupos", 
      description: `Gestión de grupos para el abogado ${abogado.nombre}` 
    });
    // En una implementación real, aquí se abriría un diálogo para gestionar los grupos
  };

  const expedienteColumns = [
    { key: 'numero', header: 'Número' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'asignado', header: 'Asignado a', cell: (row: any) => row.asignado || 'Sin asignar' },
    { key: 'fecha', header: 'Fecha de ingreso' },
    { 
      key: 'estado',
      header: 'Estado',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.tomado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.tomado ? 'Tomado' : 'Pendiente'}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleVerExpediente(row)}
          >
            Ver
          </button>
          {!row.tomado && (
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

  const grupoColumns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'tipo', header: 'Tipo de Proceso' },
    { key: 'miembros', header: 'Miembros' },
    { 
      key: 'estado',
      header: 'Estado',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleActivarDesactivarGrupo(row)}
          >
            {row.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleEditarGrupo(row)}
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  const abogadoColumns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'grupos', header: 'Grupos' },
    { 
      key: 'estado',
      header: 'Estado',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.disponible ? 'Disponible' : 'No disponible'}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleGestionarDisponibilidad(row)}
          >
            {row.disponible ? 'Marcar ausente' : 'Marcar disponible'}
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => handleGestionarGrupos(row)}
          >
            Grupos
          </button>
        </div>
      ),
    },
  ];

  const navigateToPage = (page: string) => {
    navigate(`/defensor/${page}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Panel del Defensor</h1>
        <p className="text-muted-foreground">
          Gestione expedientes, grupos y abogados de su defensoría
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expedientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expedientes.length}</div>
              <p className="text-xs text-muted-foreground">
                {expedientes.filter(e => e.tomado).length} tomados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Grupos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grupos.filter(g => g.activo).length}/{grupos.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Abogados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {abogados.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {abogados.filter(a => a.disponible).length} disponibles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sin asignar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expedientes.filter(e => !e.asignado).length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expedientes</CardTitle>
              <CardDescription>
                Gestione los expedientes de su defensoría
              </CardDescription>
            </div>
            <Button onClick={() => navigateToPage('expedientes')}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={expedientes}
              columns={expedienteColumns}
              searchable={true}
              searchKeys={['numero', 'tipo', 'asignado']}
            />
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grupos</CardTitle>
                <CardDescription>
                  Administre los grupos de trabajo
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => navigateToPage('grupos')}>
                  Ver todos
                </Button>
                <Button variant="outline" onClick={() => 
                  toast({ 
                    title: "Nuevo grupo", 
                    description: "Crear un nuevo grupo de trabajo" 
                  })
                }>
                  Nuevo grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={grupos}
                columns={grupoColumns}
                searchable={true}
                searchKeys={['nombre', 'tipo']}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Abogados</CardTitle>
                <CardDescription>
                  Gestione los abogados y su disponibilidad
                </CardDescription>
              </div>
              <Button onClick={() => navigateToPage('abogados')}>
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={abogados}
                columns={abogadoColumns}
                searchable={true}
                searchKeys={['nombre', 'email', 'grupos']}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de reasignación de expediente */}
      <Dialog open={showReasignarDialog} onOpenChange={setShowReasignarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reasignar Expediente</DialogTitle>
            <DialogDescription>
              Seleccione un abogado para reasignar el expediente {selectedExpediente?.numero}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="abogado" className="text-sm font-medium">Seleccionar Abogado</label>
              <select
                id="abogado"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccione un abogado</option>
                {abogados.filter(a => a.disponible).map((abogado) => (
                  <option key={abogado.id} value={abogado.id}>{abogado.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasignarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReasignarExpediente}>
              Reasignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DefensorDashboard;
