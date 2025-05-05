
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BuildingCourt,
  UserCircle,
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!currentUser) return null;

  const navItems = [
    { 
      name: 'Inicio',
      path: '/dashboard',
      icon: Home,
      roles: ['administrador', 'defensor', 'mostrador', 'abogado'] 
    },
  ];

  // Role-specific menu items
  if (currentUser.role === 'administrador') {
    navItems.push(
      { name: 'Defensorías', path: '/admin/defensorias', icon: BuildingCourt, roles: ['administrador'] },
      { name: 'Usuarios', path: '/admin/usuarios', icon: Users, roles: ['administrador'] },
    );
  }
  
  if (currentUser.role === 'defensor') {
    navItems.push(
      { name: 'Expedientes', path: '/defensor/expedientes', icon: FileText, roles: ['defensor'] },
      { name: 'Grupos', path: '/defensor/grupos', icon: Users, roles: ['defensor'] },
      { name: 'Abogados', path: '/defensor/abogados', icon: Briefcase, roles: ['defensor'] },
      { name: 'Tipos de Procesos', path: '/defensor/tipos-procesos', icon: Briefcase, roles: ['defensor'] },
    );
  }
  
  if (currentUser.role === 'mostrador') {
    navItems.push(
      { name: 'Cargar Expediente', path: '/mostrador/cargar-expediente', icon: FileText, roles: ['mostrador'] },
    );
  }
  
  if (currentUser.role === 'abogado') {
    navItems.push(
      { name: 'Mis Expedientes', path: '/abogado/mis-expedientes', icon: FileText, roles: ['abogado'] },
    );
  }
  
  // Common options for all users
  navItems.push(
    { name: 'Mi Perfil', path: '/perfil', icon: UserCircle, roles: ['administrador', 'defensor', 'mostrador', 'abogado'] },
  );

  const renderNavItems = () => (
    <div className="space-y-1 py-2">
      {navItems
        .filter((item) => item.roles.includes(currentUser.role))
        .map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center py-2 px-3 text-sm rounded-md w-full transition-colors',
              location.pathname === item.path
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="mr-2 h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
    </div>
  );

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative w-64 max-w-xs bg-sidebar h-full overflow-y-auto p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center py-6">
              <h1 className="text-xl font-bold text-sidebar-foreground">
                Sistema de Defensoría
              </h1>
            </div>
            <div className="flex-1">
              {renderNavItems()}
            </div>
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                onClick={logout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 z-40 bg-sidebar">
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Sistema de Defensoría
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {renderNavItems()}
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center mb-4">
            <div className="bg-sidebar-accent rounded-full h-10 w-10 flex items-center justify-center mr-3">
              <span className="text-sidebar-accent-foreground font-semibold">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sidebar-foreground font-medium">{currentUser.name}</p>
              <p className="text-sidebar-foreground/70 text-sm">{currentUser.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
