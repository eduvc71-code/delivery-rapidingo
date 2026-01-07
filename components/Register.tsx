import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { Camera, Mail, Phone } from 'lucide-react';

export const Register: React.FC = () => {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Delivery specific
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !email) return alert('Complete los campos obligatorios');

    // Gmail validation
    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      return alert('Por favor, regístrese utilizando una cuenta de Gmail (@gmail.com).');
    }

    if (role === UserRole.DELIVERY && (!dniFront || !dniBack)) {
        return alert('Debe subir fotos de su DNI para ser repartidor.');
    }

    login({
      id: Date.now().toString(),
      role,
      phone,
      email,
      isVerified: role === UserRole.CLIENT // Auto verify client, delivery needs manual (simulated)
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{APP_NAME}</h1>
            <p className="text-gray-500">Registro único por dispositivo</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button 
                onClick={() => setRole(UserRole.CLIENT)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === UserRole.CLIENT ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
                Soy Cliente
            </button>
            <button 
                onClick={() => setRole(UserRole.DELIVERY)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === UserRole.DELIVERY ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
            >
                Soy Repartidor
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Móvil</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="tel" 
                        name="phone"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="+54 9 11..."
                        required
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Gmail)</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="email" 
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ejemplo@gmail.com"
                        required
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">
                    El navegador sugerirá tu cuenta de Google automáticamente.
                </p>
            </div>

            {role === UserRole.DELIVERY && (
                <div className="space-y-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-900">Verificación de Identidad (DNI)</p>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setDniFront(e.target.files?.[0] || null)} />
                            <Camera className="text-gray-400 mb-2" />
                            <span className="text-xs text-center text-gray-500">{dniFront ? 'Frente cargado' : 'Frente'}</span>
                        </label>
                        <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setDniBack(e.target.files?.[0] || null)} />
                            <Camera className="text-gray-400 mb-2" />
                            <span className="text-xs text-center text-gray-500">{dniBack ? 'Dorso cargado' : 'Dorso'}</span>
                        </label>
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                className={`w-full py-4 rounded-xl text-white font-bold shadow-lg mt-6 ${role === UserRole.CLIENT ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
                Comenzar
            </button>
        </form>
      </div>
    </div>
  );
};