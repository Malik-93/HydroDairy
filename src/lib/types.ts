export type Item = 'milk' | 'water' | 'house-cleaning' | 'gardener';

export interface DeliveryRecord {
  id: string;
  date: string; // ISO date format string
  item: Item;
  quantity: number; // in liters or visits
  status: 'delivered' | 'returned';
}

export interface PaymentRecord {
    id: string;
    date: string; // ISO date format string
    item: Item;
    amount: number;
    reason?: string;
}

export interface Rates {
  milk: number;
  water: number;
  'house-cleaning': number;
  gardener: number;
}
