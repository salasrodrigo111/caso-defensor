
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 pt-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 logo-text">
              Sistema de Asignación de Expedientes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gestión automatizada para la Defensoría
            </p>
          </header>

          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Sistema de Asignación Inteligente
                </h2>
                <p className="text-gray-600 mb-4">
                  Optimice la distribución de expedientes entre los abogados de su defensoría con nuestro sistema de asignación automatizada.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-defensor-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Asignación aleatoria y equitativa</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-defensor-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Gestión de grupos por tipo de proceso</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-defensor-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Control de disponibilidad de abogados</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-defensor-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Perfiles diferenciados con permisos específicos</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Perfiles del Sistema
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-defensor-800">Mostrador</h3>
                    <p className="text-sm text-gray-600">Carga expedientes y tipos de proceso</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-defensor-800">Abogado</h3>
                    <p className="text-sm text-gray-600">Visualiza y toma expedientes asignados</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-defensor-800">Defensor</h3>
                    <p className="text-sm text-gray-600">Gestiona grupos, usuarios y reasigna expedientes</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-defensor-800">Administrador</h3>
                    <p className="text-sm text-gray-600">Crea defensorías y gestiona todos los usuarios</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Sistema de Asignación de Expedientes para Defensoría
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
