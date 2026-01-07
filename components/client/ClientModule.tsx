import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, OrderType, OrderStatus, Order } from '../../types';
import { ORDER_TYPES, MOCK_ADDRESS } from '../../constants';
import { checkSpellingAndClarify } from '../../services/geminiService';
import MapPlaceholder from '../shared/MapPlaceholder';
import { AlertCircle, Check, Loader2, Send } from 'lucide-react';

export const ClientModule: React.FC = () => {
  const { currentUser, activeOrder, createOrder, updateOrder, logout } = useApp();
  const [view, setView] = useState<'MENU' | 'FORM' | 'TRACKING'>('MENU');
  const [selectedType, setSelectedType] = useState<OrderType | null>(null);
  const [orderText, setOrderText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingWarning, setShowTypingWarning] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeOrder) {
      setView('TRACKING');
    } else {
      setView('MENU');
    }
  }, [activeOrder]);

  // Timer logic for spell check suggestion
  useEffect(() => {
    if (view !== 'FORM') return;

    if (isTyping) {
      setShowTypingWarning(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (orderText.length > 5) {
           setShowTypingWarning(true);
        }
      }, 3000);
    }
    return () => {
        if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [orderText, isTyping, view]);

  const handleTypeSelect = (type: OrderType) => {
    setSelectedType(type);
    setView('FORM');
    setOrderText('');
  };

  const handleOrderSubmit = () => {
    if (!currentUser || !selectedType) return;
    
    const newOrder: Order = {
      id: Date.now().toString(),
      clientId: currentUser.id,
      type: selectedType,
      description: orderText,
      location: { lat: 0, lng: 0, address: MOCK_ADDRESS }, // Mock GPS
      status: OrderStatus.PENDING_PRICE,
      createdAt: Date.now(),
      chatHistory: [],
      photos: []
    };
    
    createOrder(newOrder);
  };

  const handleSmartCheck = async () => {
    const corrected = await checkSpellingAndClarify(orderText);
    setOrderText(corrected);
    setShowTypingWarning(false);
  };

  const handleConfirmPrice = () => {
    if (activeOrder) {
      updateOrder({ ...activeOrder, status: OrderStatus.IN_DELIVERY });
    }
  };

  const handleReceiveOrder = () => {
    if (activeOrder) {
      updateOrder({ ...activeOrder, status: OrderStatus.COMPLETED });
      // Alert and logout handled by context/effect usually, but here we just reset view via activeOrder null
    }
  };

  if (view === 'MENU') {
    return (
      <div className="p-4 space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">¿Qué necesitas hoy?</h1>
          <button onClick={logout} className="text-sm text-red-500">Salir</button>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {ORDER_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => handleTypeSelect(t.type)}
              className={`${t.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all h-40`}
            >
              <t.icon size={40} />
              <span className="font-semibold text-lg">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'FORM') {
    return (
      <div className="p-4 flex flex-col h-full">
        <button onClick={() => setView('MENU')} className="text-gray-500 mb-4 self-start">
          &larr; Volver
        </button>
        <h2 className="text-xl font-bold mb-4">Detalles del pedido</h2>
        
        <div className="relative flex-1">
          <textarea
            className="w-full h-48 p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none capitalize"
            placeholder="Describe tu pedido aquí... (Ej: 2 Hamburguesas sin cebolla)"
            value={orderText}
            onChange={(e) => {
              setOrderText(e.target.value);
              setIsTyping(true);
            }}
            spellCheck={true}
          />
          
          {showTypingWarning && (
            <div className="absolute bottom-4 right-4 animate-fade-in">
              <button 
                onClick={handleSmartCheck}
                className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm border border-blue-200"
              >
                <AlertCircle size={14} />
                Revisar con IA
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <MapPlaceholder status="Ubicación Actual" showDelivery={false} />
            </div>
          <button
            onClick={handleOrderSubmit}
            disabled={orderText.length < 5}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            Solicitar Precios
          </button>
        </div>
      </div>
    );
  }

  // TRACKING VIEW
  if (activeOrder) {
    const isPendingPrice = activeOrder.status === OrderStatus.PENDING_PRICE;
    const isWaitingConfirm = activeOrder.status === OrderStatus.WAITING_CONFIRM;
    const isInDelivery = activeOrder.status === OrderStatus.IN_DELIVERY;

    return (
      <div className="p-4 flex flex-col h-full space-y-6">
        <header className="border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Pedido en curso
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isInDelivery ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {activeOrder.status.replace('_', ' ')}
            </span>
          </h2>
        </header>

        {/* Map View */}
        <div className="w-full">
           {/* Only show live tracking if price is agreed upon */}
           {(isInDelivery || activeOrder.status === OrderStatus.COMPLETED) ? (
             <MapPlaceholder showDelivery={true} status="Repartidor en camino" />
           ) : (
             <div className="bg-gray-100 h-48 rounded-xl flex items-center justify-center text-gray-500 flex-col gap-2">
                <Loader2 className="animate-spin" />
                <p>Esperando confirmación...</p>
             </div>
           )}
        </div>

        {/* Status Actions */}
        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Tu pedido:</p>
            <p className="font-medium">{activeOrder.description}</p>
          </div>

          {isPendingPrice && (
            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Esperando cotización del repartidor...
            </div>
          )}

          {isWaitingConfirm && activeOrder.productPrice && activeOrder.servicePrice && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between text-sm">
                <span>Costo Producto:</span>
                <span>${activeOrder.productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Servicio Delivery:</span>
                <span>${activeOrder.servicePrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(activeOrder.productPrice + activeOrder.servicePrice).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleConfirmPrice}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-2"
              >
                Aceptar y Pedir
              </button>
            </div>
          )}

          {isInDelivery && (
             <div className="text-center py-4 space-y-4">
                <p className="text-gray-600">Tu pedido está en camino. ¡Prepara tu pago!</p>
                <button 
                  onClick={handleReceiveOrder}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200"
                >
                  Confirmar: Recibí mi Pedido
                </button>
             </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};