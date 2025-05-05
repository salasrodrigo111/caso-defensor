
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DefensorDashboard = () => {
  const { toast } = useToast();

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
            onClick={() => toast({ 
              title: "Ver expediente", 
              description: `Expediente ${row.numero}` 
            })}
          >
            Ver
          </button>
          {!row.tomado && (
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => toast({ 
                title: "Reasignar expediente", 
                description: `Expediente ${row.numero}` 
              })}
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
            onClick={() => toast({ 
              title: row.activo ? "Desactivar grupo" : "Activar grupo", 
              description: `Grupo ${row.nombre}` 
            })}
          >
            {row.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ 
              title: "Editar grupo", 
              description: `Grupo ${row.nombre}` 
            })}
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
            onClick={() => toast({ 
              title: "Gestionar disponibilidad", 
              description: `Abogado ${row.nombre}` 
            })}
          >
            {row.disponible ? 'Marcar ausente' : 'Marcar disponible'}
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ 
              title: "Gestionar grupos", 
              description: `Abogado ${row.nombre}` 
            })}
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
              <Button
                onClick={() => 
                  toast({ 
                    title: "Nuevo grupo", 
                    description: "Crear un nuevo grupo de trabajo" 
                  })
                }
              >
                Nuevo grupo
              </Button>
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
    </DashboardLayout>
  );
};

export default DefensorDashboard;
