
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { toast } = useToast();

  // Mock data
  const defensorias = [
    { id: 'def-1', name: 'Defensoría Civil Nº 1', mostradores: 2, abogados: 8 },
    { id: 'def-2', name: 'Defensoría Penal Nº 2', mostradores: 1, abogados: 5 },
    { id: 'def-3', name: 'Defensoría Familia Nº 3', mostradores: 2, abogados: 10 },
  ];

  const usuarios = [
    { id: '1', name: 'Administrador', email: 'admin@defensoria.gob', role: 'Administrador' },
    { id: '2', name: 'Defensor Principal', email: 'defensor@defensoria.gob', role: 'Defensor', defensoria: 'Defensoría Civil Nº 1' },
    { id: '3', name: 'Mostrador Central', email: 'mostrador@defensoria.gob', role: 'Mostrador', defensoria: 'Defensoría Civil Nº 1' },
    { id: '4', name: 'Abogado Pérez', email: 'abogado@defensoria.gob', role: 'Abogado', defensoria: 'Defensoría Civil Nº 1' },
  ];

  const defensoriaColumns = [
    { key: 'name', header: 'Nombre' },
    { key: 'mostradores', header: 'Mostradores' },
    { key: 'abogados', header: 'Abogados' },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: () => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ title: "Acción", description: "Ver detalles de defensoría" })}
          >
            Ver
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ title: "Acción", description: "Editar defensoría" })}
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  const usuariosColumns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rol' },
    { key: 'defensoria', header: 'Defensoría' },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: () => (
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ title: "Acción", description: "Ver detalles de usuario" })}
          >
            Ver
          </button>
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => toast({ title: "Acción", description: "Editar usuario" })}
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
        <h1 className="text-3xl font-bold">Panel de Administrador</h1>
        <p className="text-muted-foreground">
          Gestione defensorías y usuarios del sistema
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Defensorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{defensorias.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Mostradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usuarios.filter(u => u.role === 'Mostrador').length}
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
                {usuarios.filter(u => u.role === 'Abogado').length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Defensorías</CardTitle>
            <CardDescription>
              Lista de todas las defensorías en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={defensorias}
              columns={defensoriaColumns}
              searchable={true}
              searchKeys={['name']}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Lista de todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={usuarios}
              columns={usuariosColumns}
              searchable={true}
              searchKeys={['name', 'email', 'role']}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
