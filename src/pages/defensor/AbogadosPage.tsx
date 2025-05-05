
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { getUsersByDefensoriaAndRole, updateUserAvailability, createUser } from '@/services/supabase/usersService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AbogadosPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [abogados, setAbogados] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedAbogado, setSelectedAbogado] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'abogado'
  });
  const [leaveEndDate, setLeaveEndDate] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.defensoria) {
          const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
          setAbogados(abogadosData);
        }
      } catch (error) {
        console.error('Error fetching abogados:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos de abogados. Por favor, inténtelo de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, toast]);
  
  const handleOpenDialog = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'abogado'
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenLeaveDialog = (abogado: User) => {
    setSelectedAbogado(abogado);
    setLeaveEndDate('');
    setIsLeaveDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentUser?.defensoria) return;
      
      const userData = {
        ...formData,
        defensoria: currentUser.defensoria,
        active: true
      };
      
      await createUser(userData as Omit<User, 'id'>);
      toast({
        title: 'Abogado creado',
        description: 'El abogado ha sido creado exitosamente.',
      });
      
      // Reload abogados
      const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
      setAbogados(abogadosData);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating abogado:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el abogado. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const handleLeaveSubmit = async () => {
    if (!selectedAbogado) return;
    
    try {
      await updateUserAvailability(
        selectedAbogado.id, 
        true, 
        leaveEndDate ? new Date(leaveEndDate) : undefined
      );
      
      if (currentUser?.defensoria) {
        const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
        setAbogados(abogadosData);
      }
      
      toast({
        title: 'Ausencia registrada',
        description: 'El estado de disponibilidad del abogado ha sido actualizado.',
      });
      
      setIsLeaveDialogOpen(false);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la disponibilidad. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const toggleAvailability = async (abogado: User) => {
    try {
      await updateUserAvailability(abogado.id, !abogado.onLeave);
      
      if (currentUser?.defensoria) {
        const abogadosData = await getUsersByDefensoriaAndRole(currentUser.defensoria, 'abogado');
        setAbogados(abogadosData);
      }
      
      toast({
        title: abogado.onLeave ? 'Abogado disponible' : 'Abogado no disponible',
        description: 'El estado de disponibilidad del abogado ha sido actualizado.',
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la disponibilidad. Por favor, inténtelo de nuevo.',
      });
    }
  };
  
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { 
      key: 'groups',
      header: 'Grupos',
      cell: (row: User) => row.groups?.join(', ') || 'Sin grupos'
    },
    { 
      key: 'estado',
      header: 'Estado',
      cell: (row: User) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.active ? (row.onLeave ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 'bg-red-100 text-red-800'}`}>
          {!row.active ? 'Inactivo' : (row.onLeave ? 'Ausente' : 'Disponible')}
        </span>
      ),
    },
    { 
      key: 'actions',
      header: 'Acciones',
      cell: (row: User) => (
        <div className="flex space-x-2">
          {row.active && (
            <>
              <button 
                className="text-sm text-blue-600 hover:underline"
                onClick={() => row.onLeave ? toggleAvailability(row) : handleOpenLeaveDialog(row)}
              >
                {row.onLeave ? 'Marcar disponible' : 'Marcar ausencia'}
              </button>
              <button 
                className="text-sm text-blue-600 hover:underline"
                onClick={() => toast({ 
                  title: "Gestionar grupos", 
                  description: `Abogado ${row.name}` 
                })}
              >
                Grupos
              </button>
            </>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Abogados</h1>
        <p className="text-muted-foreground">
          Administre los abogados de su defensoría y su disponibilidad
        </p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Abogados</CardTitle>
              <CardDescription>
                Lista de abogados de la defensoría
              </CardDescription>
            </div>
            <Button onClick={handleOpenDialog}>
              Nuevo abogado
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable 
                data={abogados}
                columns={columns}
                searchable={true}
                searchKeys={['name', 'email']}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Abogado</DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo abogado.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nombre completo</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Ausencia</DialogTitle>
            <DialogDescription>
              Indique hasta cuándo estará ausente el abogado {selectedAbogado?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="leaveEndDate" className="text-sm font-medium">Fecha de finalización</label>
              <Input
                id="leaveEndDate"
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Dejar en blanco para ausencia indefinida
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleLeaveSubmit}>
                Registrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AbogadosPage;
