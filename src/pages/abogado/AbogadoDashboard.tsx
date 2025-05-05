
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const AbogadoDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Mock data
  const misExpedientes = [
    { id: 'exp-1', numero: '123456/2023', tipo: 'Civil', fecha: '2023-05-01', tomado: true },
    { id: 'exp-5', numero: '567890/2023', tipo: 'Civil', fecha: '2023-05-05', tomado: false },
    { id: 'exp-6', numero: '246810/2023', tipo: 'Civil', fecha: '2023-05-06', tomado: false },
  ];

  const expedienteColumns = [
    { key: 'numero', header: 'Número' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'fecha', header: 'Fecha de asignación' },
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
                title: "Tomar expediente", 
                description: `Has tomado el expediente ${row.numero}` 
              })}
            >
              Tomar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mis Expedientes</h1>
          <Button
            variant="outline"
            onClick={() => toast({ 
              title: "Estado de disponibilidad", 
              description: "Su estado ha sido actualizado" 
            })}
          >
            Marcar ausencia
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestione los expedientes asignados a usted
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expedientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{misExpedientes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expedientes Tomados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {misExpedientes.filter(e => e.tomado).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((misExpedientes.filter(e => e.tomado).length / misExpedientes.length) * 100)}% del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expedientes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {misExpedientes.filter(e => !e.tomado).length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mis Expedientes</CardTitle>
            <CardDescription>
              Expedientes asignados a {currentUser?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={misExpedientes}
              columns={expedienteColumns}
              searchable={true}
              searchKeys={['numero', 'tipo']}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>
              Sus datos y pertenencia a grupos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Datos personales</h3>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Nombre:</div>
                    <div>{currentUser?.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Email:</div>
                    <div>{currentUser?.email}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Defensoría:</div>
                    <div>{currentUser?.defensoria}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Estado:</div>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Grupos</h3>
                <div className="mt-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="font-medium">Civil Grupo A</div>
                    <div className="text-sm text-gray-500">Grupo activo</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AbogadoDashboard;
