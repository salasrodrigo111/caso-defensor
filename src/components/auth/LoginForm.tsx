
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await login(email, password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Has iniciado sesión correctamente.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: 'Credenciales incorrectas. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Mock login shortcuts for demo
  const loginAs = async (role: string) => {
    let mockEmail = '';
    
    switch (role) {
      case 'admin':
        mockEmail = 'admin@defensoria.gob';
        break;
      case 'defensor':
        mockEmail = 'defensor@defensoria.gob';
        break;
      case 'mostrador':
        mockEmail = 'mostrador@defensoria.gob';
        break;
      case 'abogado':
        mockEmail = 'abogado@defensoria.gob';
        break;
    }
    
    setEmail(mockEmail);
    setPassword('password');
    
    try {
      await login(mockEmail, 'password');
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Has iniciado sesión como ${role}.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingrese sus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
            <Input
              id="email"
              type="email"
              placeholder="correo@defensoria.gob"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-center text-gray-500 mb-2">
          Para fines de demo, puede iniciar sesión como:
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => loginAs('admin')}>
            Administrador
          </Button>
          <Button variant="outline" size="sm" onClick={() => loginAs('defensor')}>
            Defensor
          </Button>
          <Button variant="outline" size="sm" onClick={() => loginAs('mostrador')}>
            Mostrador
          </Button>
          <Button variant="outline" size="sm" onClick={() => loginAs('abogado')}>
            Abogado
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
