
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MostradorDashboard = () => {
  const { toast } = useToast();
  const [expedienteNum, setExpedienteNum] = useState('');
  const [tipoProceso, setTipoProceso] = useState('');

  // Mock data
  const tiposProceso = [
    { id: 'tipo-1', nombre: 'Civil' },
    { id: 'tipo-2', nombre: 'Familia' },
    { id: 'tipo-3', nombre: 'Penal' },
    { id: 'tipo-4', nombre: 'Laboral' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expedienteNum.trim()) {
      toast({
        title: 'Error',
        description: 'El número de expediente es obligatorio',
        variant: 'destructive',
      });
      return;
    }
    
    if (!tipoProceso) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un tipo de proceso',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Expediente registrado',
      description: `El expediente ${expedienteNum} ha sido asignado correctamente`,
    });
    
    // Reset form
    setExpedienteNum('');
    setTipoProceso('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cargar Nuevo Expediente</h1>
        <p className="text-muted-foreground">
          Complete los datos para cargar un nuevo expediente en el sistema
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Cargar Expediente</CardTitle>
              <CardDescription>
                Ingrese los datos del nuevo expediente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expediente">Número de Expediente</Label>
                  <Input
                    id="expediente"
                    placeholder="Ej: 123456/2023"
                    value={expedienteNum}
                    onChange={(e) => setExpedienteNum(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Proceso</Label>
                  <Select value={tipoProceso} onValueChange={setTipoProceso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de proceso" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposProceso.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">
                  Asignar Expediente
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>
                Instrucciones para cargar expedientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">¿Cómo funciona el sistema de asignación?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  El sistema asigna automáticamente el expediente a un abogado disponible 
                  del grupo activo correspondiente al tipo de proceso seleccionado.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">¿Qué ocurre después de cargar el expediente?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  El expediente será asignado aleatoriamente a un abogado disponible. 
                  Si todos los abogados ya tienen asignaciones, se seguirá un orden equitativo.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">¿Necesita ayuda?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Si tiene dudas sobre el proceso de asignación o encuentra algún problema, 
                  contacte al administrador del sistema.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800">Recuerde</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Verifique que el número de expediente y el tipo de proceso sean correctos 
                  antes de realizar la asignación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimos expedientes cargados</CardTitle>
            <CardDescription>
              Los últimos 5 expedientes ingresados por usted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      890123/2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Civil
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2023-05-10
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      456789/2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Familia
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2023-05-09
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      123456/2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Penal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2023-05-08
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MostradorDashboard;
