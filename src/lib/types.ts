export interface DeliveryRecord {
  id: string;
  date: string; // ISO date format string
  item: 'milk' | 'water';
  quantity: number; // in liters
  status: 'delivered' | 'returned';
}
