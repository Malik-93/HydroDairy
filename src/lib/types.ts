export interface DeliveryRecord {
  id: string;
  date: string; // ISO date format string
  item: 'milk' | 'water' | 'house-cleaning' | 'gardener';
  quantity: number; // in liters or visits
  status: 'delivered' | 'returned';
}
