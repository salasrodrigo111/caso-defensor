
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'administrador':
          navigate('/admin/dashboard');
          break;
        case 'defensor':
          navigate('/defensor/dashboard');
          break;
        case 'mostrador':
          navigate('/mostrador/dashboard');
          break;
        case 'abogado':
          navigate('/abogado/dashboard');
          break;
        default:
          // Stay on generic dashboard
          break;
      }
    }
  }, [currentUser, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Panel Principal</h1>
        <p className="text-muted-foreground">
          Bienvenido al Sistema de Asignación de Expedientes para Defensorías.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expedientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0% respecto al mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expedientes Asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                0% de asignación
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Abogados Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                0% de disponibilidad
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                0 tipos de procesos
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Sistema</CardTitle>
              <CardDescription>
                Estado actual del sistema de asignaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                El sistema actualmente no tiene datos cargados. Por favor, acceda
                a su sección específica para comenzar a utilizar el sistema según
                su rol.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>
                Detalles de su cuenta y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Nombre:</span> {currentUser?.name}
                </div>
                <div>
                  <span className="font-medium">Correo:</span> {currentUser?.email}
                </div>
                <div>
                  <span className="font-medium">Rol:</span> {currentUser?.role}
                </div>
                {currentUser?.defensoria && (
                  <div>
                    <span className="font-medium">Defensoría:</span>{' '}
                    {currentUser.defensoria}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
