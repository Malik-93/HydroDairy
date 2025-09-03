

"use client";

import { useState, useEffect, useMemo } from 'react';
import type { DeliveryRecord, Rates, Item, PaymentRecord } from '@/lib/types';
import { calculateTotals, calculateBill, calculateDaysWithoutDelivery, calculatePayments } from '@/lib/calculations';
import {
  getDeliveryRecords,
  addDeliveryRecord,
  updateDeliveryRecord,
  deleteDeliveryRecord,
  getRates,
  addPaymentRecord,
  getPaymentRecords,
  deletePaymentRecord,
} from '@/lib/firestore';
import { DeliveryForm } from './DeliveryForm';
import { DeliveriesTable } from './DeliveriesTable';
import { SummaryCard } from './SummaryCard';
import { ReminderCard } from './ReminderCard';
import { MilkIcon } from './icons';
import { Droplets, Home, Flower, Settings } from 'lucide-react';
import { EditDeliveryDialog } from './EditDeliveryDialog';
import { AddPaymentDialog } from './AddPaymentDialog';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_RATES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from './ui/button';
import { startOfMonth } from 'date-fns';
import { DateRangePicker } from './ui/date-range-picker';
import { PaymentsHistoryTable } from './PaymentsHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


type PaymentState = {
    item: Item | null,
    amount: number
}
export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({ item: null, amount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const fetchInitialData = async () => {
      try {
        const [fetchedDeliveries, fetchedPayments, fetchedRates] = await Promise.all([
          getDeliveryRecords(),
          getPaymentRecords(),
          getRates(),
        ]);
        setDeliveryRecords(fetchedDeliveries);
        setPaymentRecords(fetchedPayments);
        if (fetchedRates) {
          setRates(fetchedRates);
        }
      } catch (error) {
        console.error("Failed to fetch data from Firestore", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load records from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  const handleAddRecord = async (newRecord: Omit<DeliveryRecord, 'id'>) => {
    try {
      const newId = await addDeliveryRecord(newRecord);
      const recordWithId = { ...newRecord, id: newId };
      const sortedRecords = [...deliveryRecords, recordWithId].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setDeliveryRecords(sortedRecords);
    } catch (error) {
      console.error("Error adding record: ", error);
      toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to add the delivery record.",
      });
    }
  };

  const handleUpdateRecord = async (updatedRecord: DeliveryRecord) => {
    try {
      await updateDeliveryRecord(updatedRecord);
      const updatedRecords = deliveryRecords.map((r) =>
        r.id === updatedRecord.id ? updatedRecord : r
      );
      const sortedRecords = updatedRecords.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setDeliveryRecords(sortedRecords);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating record: ", error);
      toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to update the delivery record.",
      });
    }
  };

  const handleRemoveDeliveryRecord = async (id: string) => {
    try {
      await deleteDeliveryRecord(id);
      setDeliveryRecords(deliveryRecords.filter((record) => record.id !== id));
    } catch (error)
    {
      console.error("Error deleting record: ", error);
      toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to delete the delivery record.",
      });
    }
  };
  
  const handleRemovePaymentRecord = async (id: string) => {
    try {
      await deletePaymentRecord(id);
      setPaymentRecords(paymentRecords.filter((record) => record.id !== id));
    } catch (error)
    {
      console.error("Error deleting payment: ", error);
      toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to delete the payment record.",
      });
    }
  }

  const handleAddPayment = async (payment: Omit<PaymentRecord, 'id'>) => {
      try {
        const newId = await addPaymentRecord(payment);
        const newPayment = { ...payment, id: newId };
        const sortedPayments = [...paymentRecords, newPayment].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setPaymentRecords(sortedPayments);
        toast({
            title: "Payment Added",
            description: `Payment of ${payment.amount} PKR for ${payment.item} has been recorded.`
        })
      } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add payment record.",
        });
      }
      setPaymentState({ item: null, amount: 0 });
  }
  
  const filteredDeliveryRecords = useMemo(() => {
    let result = deliveryRecords;

    const fromDate = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
    const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;

    result = result.filter((record) => {
        const recordDate = new Date(record.date);
        if (fromDate && recordDate < fromDate) return false;
        if (toDate && recordDate > toDate) return false;
        return true;
    });

    if (itemFilter !== 'all') {
      return result.filter((record) => record.item === itemFilter);
    }
    return result;
  }, [deliveryRecords, dateRange, itemFilter]);

  const filteredPaymentRecords = useMemo(() => {
    let result = paymentRecords;

    const fromDate = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
    const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;

    result = result.filter((record) => {
        const recordDate = new Date(record.date);
        if (fromDate && recordDate < fromDate) return false;
        if (toDate && recordDate > toDate) return false;
        return true;
    });

    if (itemFilter !== 'all') {
      return result.filter((record) => record.item === itemFilter);
    }
    return result;
  }, [paymentRecords, dateRange, itemFilter]);


  const summary = useMemo(() => {
    if (!isMounted) {
        return {
            totals: { milk: 0, water: 0, 'house-cleaning': 0, gardener: 0 },
            bill: { milkBill: 0, waterBill: 0, houseCleaningBill: 0, gardenerBill: 0 },
            totalBill: { milkBill: 0, waterBill: 0, houseCleaningBill: 0, gardenerBill: 0 },
            daysWithoutDelivery: { milk: null, water: null, houseCleaning: null, gardener: null }
        };
    }
    // Bill for the selected period
    const periodTotals = calculateTotals(filteredDeliveryRecords);
    const periodBill = calculateBill(periodTotals, rates);
    
    // Total outstanding bill
    const allDeliveriesTotals = calculateTotals(deliveryRecords);
    const allDeliveriesBill = calculateBill(allDeliveriesTotals, rates);
    const allPayments = calculatePayments(paymentRecords);
    const totalBill = {
        milkBill: allDeliveriesBill.milkBill - allPayments.milk,
        waterBill: allDeliveriesBill.waterBill - allPayments.water,
        houseCleaningBill: allDeliveriesBill.houseCleaningBill - allPayments['house-cleaning'],
        gardenerBill: allDeliveriesBill.gardenerBill - allPayments.gardener,
    };
    
    const daysWithoutDelivery = calculateDaysWithoutDelivery(deliveryRecords);
    return { totals: periodTotals, bill: periodBill, totalBill: totalBill, daysWithoutDelivery };
  }, [filteredDeliveryRecords, isMounted, rates, deliveryRecords, paymentRecords]);
  
  if (isLoading && !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading delivery data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Household Tracker</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker 
              date={dateRange}
              onDateChange={setDateRange}
          />
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <SummaryCard
            title="Milk"
            value={`${summary.totals.milk.toFixed(2)} KG`}
            icon={<MilkIcon className="h-6 w-6 text-muted-foreground" />}
            bill={summary.bill.milkBill}
            totalBill={summary.totalBill.milkBill}
            onSettleBill={() => setPaymentState({ item: 'milk', amount: summary.totalBill.milkBill })}
            className="bg-accent/20"
          />
          <SummaryCard
            title="Water"
            value={`${summary.totals.water.toFixed(2)} Bottles`}
            icon={<Droplets className="h-6 w-6 text-muted-foreground" />}
            bill={summary.bill.waterBill}
            totalBill={summary.totalBill.waterBill}
            onSettleBill={() => setPaymentState({ item: 'water', amount: summary.totalBill.waterBill })}
            className="bg-primary/20"
          />
          <SummaryCard
            title="House Cleaning"
            value={`${summary.totals['house-cleaning']} visits`}
            icon={<Home className="h-6 w-6 text-muted-foreground" />}
            bill={summary.bill.houseCleaningBill}
            totalBill={summary.totalBill.houseCleaningBill}
            onSettleBill={() => setPaymentState({ item: 'house-cleaning', amount: summary.totalBill.houseCleaningBill })}
            className="bg-green-500/20"
          />
          <SummaryCard
            title="Gardener"
            value={`${summary.totals.gardener} visits`}
            icon={<Flower className="h-6 w-6 text-muted-foreground" />}
            bill={summary.bill.gardenerBill}
            totalBill={summary.totalBill.gardenerBill}
            onSettleBill={() => setPaymentState({ item: 'gardener', amount: summary.totalBill.gardenerBill })}
            className="bg-purple-500/20"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <DeliveryForm onAddRecord={handleAddRecord} />
              <ReminderCard daysWithoutDelivery={summary.daysWithoutDelivery} />
            </div>
            <div className="lg:col-span-3">
              <Tabs defaultValue="deliveries">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deliveries">Delivery History</TabsTrigger>
                  <TabsTrigger value="payments">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="deliveries">
                  <DeliveriesTable 
                    records={filteredDeliveryRecords} 
                    onRemoveRecord={handleRemoveDeliveryRecord} 
                    onEditRecord={setEditingRecord}
                    filter={itemFilter}
                    onFilterChange={setItemFilter}
                  />
                </TabsContent>
                <TabsContent value="payments">
                    <PaymentsHistoryTable
                      records={filteredPaymentRecords}
                      onRemoveRecord={handleRemovePaymentRecord}
                      filter={itemFilter}
                      onFilterChange={setItemFilter}
                    />
                </TabsContent>
              </Tabs>
            </div>
        </div>
      </main>
      {editingRecord && (
        <EditDeliveryDialog
          record={editingRecord}
          onUpdateRecord={handleUpdateRecord}
          onOpenChange={(isOpen) => !isOpen && setEditingRecord(null)}
        />
      )}
       {paymentState.item && (
        <AddPaymentDialog
            item={paymentState.item}
            prefilledAmount={paymentState.amount > 0 ? paymentState.amount : 0}
            onAddPayment={handleAddPayment}
            onOpenChange={(isOpen) => !isOpen && setPaymentState({ item: null, amount: 0 })}
        />
       )}
    </div>
  );
}
