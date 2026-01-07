import { OrderType } from './types';
import { Utensils, ShoppingCart, Pill, Package } from 'lucide-react';

export const APP_NAME = "Delivery RAPIDINGO";

export const ORDER_TYPES = [
  { type: OrderType.RESTAURANT, icon: Utensils, label: 'Restaurante', color: 'bg-orange-100 text-orange-600' },
  { type: OrderType.SUPERMARKET, icon: ShoppingCart, label: 'Super', color: 'bg-green-100 text-green-600' },
  { type: OrderType.PHARMACY, icon: Pill, label: 'Farmacia', color: 'bg-blue-100 text-blue-600' },
  { type: OrderType.OTHER, icon: Package, label: 'Otros', color: 'bg-purple-100 text-purple-600' },
];

export const MOCK_ADDRESS = "Av. Principal 123, Ciudad Central";