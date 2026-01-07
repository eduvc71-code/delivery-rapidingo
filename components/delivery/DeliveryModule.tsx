import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, Order } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, DollarSign, Clock, CheckCircle } from 'lucide-react';
import MapPlaceholder from '../shared/MapPlaceholder';

export const DeliveryModule: React.FC = () => {
  const { activeOrder, updateOrder, pastOrders, currentUser, logout } = useApp();
  const [view, setView] = useState<'DASHBOARD' | 'ACTIVE_ORDER'>('DASHBOARD');
  
  // Pricing state
  const [productCost, setProductCost] = useState('');
  const [serviceCost, setServiceCost] = useState('');

  // Derived stats
  const totalEarnings = pastOrders.reduce((acc, o) => acc + (o.servicePrice || 0), 0);
  const totalOrders = pastOrders.length;
  
  // Mock data for chart
  const data = [
    { name: 'Lun', earnings: 120 },
    { name: 'Mar', earnings: 200 },
    { name: 'Mie', earnings: 150 },
    { name: 'Jue', earnings: 280 },
    { name: 'Vie', earnings: 190 },
    { name: 'Sab', earnings: 350 },
    { name: 'Dom', earnings: 300 },
  ];

  const handleSetPrice = () => {
    if (!activeOrder) return;
    const pCost = parseFloat(productCost);
    const sCost = parseFloat(serviceCost);

    if (isNaN(pCost) || isNaN(sCost) || pCost < 0 || sCost < 0) {
      alert("Por favor ingrese costos válidos.");
      return;
    }

    const total = pCost + sCost;
    updateOrder({
      ...activeOrder,
      productPrice: pCost,
      servicePrice: sCost,
      totalPrice: total,
      status: OrderStatus.WAITING_CONFIRM
    });
  };

  if (activeOrder && view === 'DASHBOARD') {
      // Auto switch to active order view if there is one
      setView('ACTIVE_ORDER');
  }

  if (view === 'ACTIVE_ORDER' && activeOrder) {
    const isPendingPrice = activeOrder.status === OrderStatus.PENDING_PRICE;
    const isConfirmed = activeOrder.status === OrderStatus.IN_DELIVERY;
    const isWaiting = activeOrder.status === OrderStatus.WAITING_CONFIRM;

    return (
      <div className="p-4 flex flex-col h-full space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
           <h2 className="text-xl font-bold">Pedido Activo</h2>
           <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">{activeOrder.status}</span>
        </div>

        {/* Map */}
        <MapPlaceholder showDelivery={true} status="Ubicación Cliente" />

        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-700">Detalles</h3>
            <p className="text-gray-800 text-lg">{activeOrder.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Solicitado hace 5 min</span>
            </div>
        </div>

        {isPendingPrice && (
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Cotizar Pedido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Costo Producto</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input 
                        type="number" 
                        value={productCost}
                        onChange={(e) => setProductCost(e.target.value)}
                        className="w-full pl-6 p-2 border rounded-lg focus:ring-orange-500 outline-none"
                        placeholder="0.00"
                    />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tarifa Delivery</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input 
                        type="number" 
                        value={serviceCost}
                        onChange={(e) => setServiceCost(e.target.value)}
                        className="w-full pl-6 p-2 border rounded-lg focus:ring-orange-500 outline-none"
                        placeholder="0.00"
                    />
                </div>
              </div>
            </div>
            {productCost && serviceCost && (
                <div className="bg-gray-50 p-2 rounded text-right font-bold">
                    Total: ${(parseFloat(productCost||'0') + parseFloat(serviceCost||'0')).toFixed(2)}
                </div>
            )}
            <button 
                onClick={handleSetPrice}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200"
            >
                Enviar Presupuesto
            </button>
          </div>
        )}

        {isWaiting && (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-center">
                Esperando confirmación del cliente...
            </div>
        )}

        {isConfirmed && (
            <div className="p-4 bg-green-50 text-green-800 rounded-xl text-center flex flex-col items-center gap-2">
                <Truck size={32} />
                <span className="font-bold">¡En curso! Dirígete al destino.</span>
                <p className="text-sm">El cliente cerrará el pedido al recibirlo.</p>
            </div>
        )}
      </div>
    );
  }

  // DASHBOARD VIEW
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Hola, {currentUser?.email?.split('@')[0]}</h1>
           <p className="text-sm text-gray-500">Panel de Control</p>
        </div>
        <button onClick={logout} className="text-sm text-red-500 font-medium">Salir</button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-green-600 mb-1">
             <DollarSign size={20} />
             <span className="font-semibold text-sm">Ganancias</span>
           </div>
           <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-blue-600 mb-1">
             <CheckCircle size={20} />
             <span className="font-semibold text-sm">Entregas</span>
           </div>
           <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
      </div>

      {/* Available Orders Mock */}
      {!activeOrder && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">Pedidos Disponibles</h3>
             </div>
             <div className="p-8 text-center text-gray-400">
                <p>No hay pedidos nuevos por el momento.</p>
                <p className="text-sm mt-2">Te notificaremos cuando llegue uno.</p>
             </div>
          </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
         <h3 className="font-semibold mb-4">Rendimiento Semanal</h3>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="earnings" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};