"use client";

import { useState, useEffect, useMemo } from 'react';
import type { DeliveryRecord } from '@/lib/types';
import { calculateTotals, calculateBill, calculateDaysWithoutDelivery } from '@/lib/calculations';
import {
  getDeliveryRecords,
  addDeliveryRecord,
  updateDeliveryRecord,
  deleteDeliveryRecord,
} from '@/lib/firestore';
import { DeliveryForm } from './DeliveryForm';
import { DeliveriesTable } from './DeliveriesTable';
import { SummaryCard } from './SummaryCard';
import { ReminderCard } from './ReminderCard';
import { MilkIcon } from './icons';
import { Droplets } from 'lucide-react';
import { EditDeliveryDialog } from './EditDeliveryDialog';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const fetchRecords = async () => {
      try {
        const fetchedRecords = await getDeliveryRecords();
        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Failed to fetch records from Firestore", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load delivery records from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [toast]);

  const handleAddRecord = async (newRecord: Omit<DeliveryRecord, 'id'>) => {
    try {
      const newId = await addDeliveryRecord(newRecord);
      const recordWithId = { ...newRecord, id: newId };
      const sortedRecords = [...records, recordWithId].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecords(sortedRecords);
    } catch (error) {
       console.error("Error adding record: ", error);
       toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add the new delivery record.",
       });
    }
  };

  const handleUpdateRecord = async (updatedRecord: DeliveryRecord) => {
    try {
      await updateDeliveryRecord(updatedRecord);
      const updatedRecords = records.map((r) =>
        r.id === updatedRecord.id ? updatedRecord : r
      );
      const sortedRecords = updatedRecords.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecords(sortedRecords);
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

  const handleRemoveRecord = async (id: string) => {
    try {
      await deleteDeliveryRecord(id);
      setRecords(records.filter((record) => record.id !== id));
    } catch (error) {
      console.error("Error deleting record: ", error);
      toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to delete the delivery record.",
      });
    }
  };
  
  const summary = useMemo(() => {
    if (!isMounted) {
        return {
            totals: { milk: 0, water: 0 },
            bill: { milkBill: 0, waterBill: 0 },
            daysWithoutDelivery: { milk: null, water: null }
        };
    }
    const totals = calculateTotals(records);
    const bill = calculateBill(totals);
    const daysWithoutDelivery = calculateDaysWithoutDelivery(records);
    return { totals, bill, daysWithoutDelivery };
  }, [records, isMounted]);
  
  if (isLoading && isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading delivery data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">HydroDairy Tracker</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
          <SummaryCard
            title="Total Milk Delivered"
            value={`${summary.totals.milk.toFixed(2)} L`}
            icon={<MilkIcon className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.milkBill.toFixed(2)} PKR`}
            className="bg-accent/20"
          />
          <SummaryCard
            title="Total Water Delivered"
            value={`${summary.totals.water.toFixed(2)} L`}
            icon={<Droplets className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.waterBill.toFixed(2)} PKR`}
            className="bg-primary/20"
          />
          <SummaryCard
            title="Days Since Last Milk"
            value={summary.daysWithoutDelivery.milk !== null ? `${summary.daysWithoutDelivery.milk}` : 'N/A'}
            icon={<MilkIcon className="h-6 w-6 text-muted-foreground" />}
            footerText={summary.daysWithoutDelivery.milk === null ? "No deliveries yet" : "days ago"}
            className="bg-accent/20"
          />
          <SummaryCard
            title="Days Since Last Water"
            value={summary.daysWithoutDelivery.water !== null ? `${summary.daysWithoutDelivery.water}` : 'N/A'}
            icon={<Droplets className="h-6 w-6 text-muted-foreground" />}
            footerText={summary.daysWithoutDelivery.water === null ? "No deliveries yet" : "days ago"}
            className="bg-primary/20"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <DeliveryForm onAddRecord={handleAddRecord} />
              <ReminderCard daysWithoutDelivery={summary.daysWithoutDelivery} />
            </div>
            <div className="lg:col-span-3">
              <DeliveriesTable records={records} onRemoveRecord={handleRemoveRecord} onEditRecord={setEditingRecord} />
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
    </div>
  );
}
