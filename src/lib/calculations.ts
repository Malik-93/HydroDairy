import type { DeliveryRecord } from './types';
import { PRICE_PER_LITER } from './constants';
import { differenceInDays, parseISO, startOfToday } from 'date-fns';

export const calculateTotals = (records: DeliveryRecord[]) => {
  return records.reduce(
    (acc, record) => {
      const quantity = record.status === 'returned' ? -record.quantity : record.quantity;
      if (record.item === 'milk') {
        acc.milk += quantity;
      } else if (record.item === 'water') {
        acc.water += quantity;
      }
      return acc;
    },
    { milk: 0, water: 0 }
  );
};

export const calculateBill = (totals: { milk: number; water: number }) => {
  return {
    milkBill: totals.milk * PRICE_PER_LITER.milk,
    waterBill: totals.water * PRICE_PER_LITER.water,
  };
};

export const calculateDaysWithoutDelivery = (records: DeliveryRecord[]) => {
  const today = startOfToday();
  
  const lastMilkDelivery = records
    .filter((r) => r.item === 'milk' && r.status === 'delivered')
    .map((r) => parseISO(r.date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const lastWaterDelivery = records
    .filter((r) => r.item === 'water' && r.status === 'delivered')
    .map((r) => parseISO(r.date))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  
  const milkDays = lastMilkDelivery ? differenceInDays(today, lastMilkDelivery) : null;
  const waterDays = lastWaterDelivery ? differenceInDays(today, lastWaterDelivery) : null;

  return { milk: milkDays, water: waterDays };
};
