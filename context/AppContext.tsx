import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order, UserRole, OrderStatus, ChatMessage } from '../types';

interface AppContextType {
  currentUser: User | null;
  activeOrder: Order | null; // Simulating single active order for demo
  pastOrders: Order[]; // For delivery reports
  login: (user: User) => void;
  logout: () => void; // Only for full reset or switch role
  createOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  addChatMessage: (msg: ChatMessage) => void;
  switchRole: (role: UserRole) => void; // Dev helper
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rapidEnvios_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    const storedOrder = localStorage.getItem('rapidEnvios_activeOrder');
    if (storedOrder) {
      setActiveOrder(JSON.parse(storedOrder));
    }

    const storedHistory = localStorage.getItem('rapidEnvios_history');
    if (storedHistory) {
      setPastOrders(JSON.parse(storedHistory));
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (currentUser) localStorage.setItem('rapidEnvios_user', JSON.stringify(currentUser));
    else localStorage.removeItem('rapidEnvios_user');
  }, [currentUser]);

  useEffect(() => {
    if (activeOrder) localStorage.setItem('rapidEnvios_activeOrder', JSON.stringify(activeOrder));
    else localStorage.removeItem('rapidEnvios_activeOrder');
  }, [activeOrder]);

  useEffect(() => {
    localStorage.setItem('rapidEnvios_history', JSON.stringify(pastOrders));
  }, [pastOrders]);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    // In production, we might keep the user logged in but just close the session.
    // For this demo, we clear user to restart flow.
    setCurrentUser(null);
    setActiveOrder(null);
    localStorage.clear();
  };

  const createOrder = (order: Order) => {
    setActiveOrder(order);
  };

  const updateOrder = (updatedOrder: Order) => {
    setActiveOrder(updatedOrder);
    if (updatedOrder.status === OrderStatus.COMPLETED) {
      setPastOrders(prev => [...prev, updatedOrder]);
      setActiveOrder(null); // Clear active order on completion
    }
  };

  const addChatMessage = (msg: ChatMessage) => {
    if (!activeOrder) return;
    const updatedOrder = {
      ...activeOrder,
      chatHistory: [...activeOrder.chatHistory, msg]
    };
    setActiveOrder(updatedOrder);
  };

  const switchRole = (role: UserRole) => {
    if (currentUser) {
      // Just for demo purposes, switch the role in state so we can see other view
      setCurrentUser({ ...currentUser, role });
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      activeOrder, 
      pastOrders,
      login, 
      logout, 
      createOrder, 
      updateOrder, 
      addChatMessage,
      switchRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};