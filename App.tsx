import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Register } from './components/Register';
import { ClientModule } from './components/client/ClientModule';
import { DeliveryModule } from './components/delivery/DeliveryModule';
import { UserRole } from './types';
import { Smartphone, RefreshCw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, switchRole } = useApp();

  if (!currentUser) {
    return <Register />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Mobile Frame Simulation */}
      <div className="w-full max-w-md h-[100dvh] bg-white sm:rounded-[3rem] sm:h-[90vh] sm:border-[8px] sm:border-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Notch/Header for Desktop simulation */}
        <div className="bg-gray-800 text-white p-2 text-center text-xs hidden sm:block absolute top-0 w-full z-50 rounded-t-[2.5rem]">
           Simulación de Dispositivo
        </div>

        {/* Dynamic Island / Status Bar */}
        <div className="h-6 sm:h-8 w-full bg-white z-40 shrink-0"></div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-safe relative">
          {currentUser.role === UserRole.CLIENT ? <ClientModule /> : <DeliveryModule />}
        </div>

        {/* Safe Area Bottom */}
        <div className="h-6 w-full bg-white shrink-0 sm:rounded-b-[2.5rem]"></div>

        {/* Developer Floating Button to Switch Roles */}
        <button 
          onClick={() => switchRole(currentUser.role === UserRole.CLIENT ? UserRole.DELIVERY : UserRole.CLIENT)}
          className="absolute bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-xl hover:scale-105 transition-transform"
          title="Cambiar Rol (Demo)"
        >
          <RefreshCw size={20} />
        </button>

      </div>
      
      <p className="mt-4 text-gray-500 text-sm hidden sm:block">
        <Smartphone className="inline mr-1" size={16}/> 
        Vista previa móvil
      </p>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}