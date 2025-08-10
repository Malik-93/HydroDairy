"use client";

import { useState, useEffect, useMemo } from 'react';
import type { DeliveryRecord, Rates } from '@/lib/types';
import { calculateTotals, calculateBill } from '@/lib/calculations';
import {
  getDeliveryRecords,
  addDeliveryRecord,
  updateDeliveryRecord,
  deleteDeliveryRecord,
  getRates,
} from '@/lib/firestore';
import { DeliveryForm } from './DeliveryForm';
import { DeliveriesTable } from './DeliveriesTable';
import { SummaryCard } from './SummaryCard';
import { ReminderCard } from './ReminderCard';
import { MilkIcon } from './icons';
import { Droplets, Home, Flower, Settings } from 'lucide-react';
import { EditDeliveryDialog } from './EditDeliveryDialog';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_RATES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [itemFilter, setItemFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const fetchInitialData = async () => {
      try {
        const [fetchedRecords, fetchedRates] = await Promise.all([
          getDeliveryRecords(),
          getRates(),
        ]);
        setRecords(fetchedRecords);
        if (fetchedRates) {
          setRates(fetchedRates);
        }
      } catch (error) {
        console.error("Failed to fetch data from Firestore", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load delivery records or rates from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  const handleAddRecord = async (newRecord: Omit<DeliveryRecord, 'id'>) => {
    const newId = await addDeliveryRecord(newRecord);
    const recordWithId = { ...newRecord, id: newId };
    const sortedRecords = [...records, recordWithId].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecords(sortedRecords);
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
  
  const filteredRecords = useMemo(() => {
    if (itemFilter === 'all') {
      return records;
    }
    return records.filter((record) => record.item === itemFilter);
  }, [records, itemFilter]);
  
  const summary = useMemo(() => {
    if (!isMounted) {
        return {
            totals: { milk: 0, water: 0, houseCleaning: 0, gardener: 0 },
            bill: { milkBill: 0, waterBill: 0, houseCleaningBill: 0, gardenerBill: 0 },
            daysWithoutDelivery: { milk: null, water: null, houseCleaning: null, gardener: null }
        };
    }
    const totals = calculateTotals(records);
    const bill = calculateBill(totals, rates);
    const daysWithoutDelivery = { milk: null, water: null, houseCleaning: null, gardener: null };
    return { totals, bill, daysWithoutDelivery };
  }, [records, isMounted, rates]);
  
  if (isLoading && isMounted) {
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
        <Link href="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <SummaryCard
            title="Total Milk Delivered"
            value={`${summary.totals.milk.toFixed(2)} (KG)`}
            icon={<MilkIcon className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.milkBill.toFixed(2)} PKR`}
            className="bg-accent/20"
          />
          <SummaryCard
            title="Total Water Delivered"
            value={`${summary.totals.water.toFixed(2)} (Bottles)`}
            icon={<Droplets className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.waterBill.toFixed(2)} PKR`}
            className="bg-primary/20"
          />
          <SummaryCard
            title="House Cleaning Visits"
            value={`${summary.totals.houseCleaning} visits`}
            icon={<Home className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.houseCleaningBill.toFixed(2)} PKR`}
            className="bg-green-500/20"
          />
          <SummaryCard
            title="Gardener Visits"
            value={`${summary.totals.gardener} visits`}
            icon={<Flower className="h-6 w-6 text-muted-foreground" />}
            footerText={`${summary.bill.gardenerBill.toFixed(2)} PKR`}
            className="bg-purple-500/20"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <DeliveryForm onAddRecord={handleAddRecord} />
              <ReminderCard daysWithoutDelivery={summary.daysWithoutDelivery} />
            </div>
            <div className="lg:col-span-3">
              <DeliveriesTable 
                records={filteredRecords} 
                onRemoveRecord={handleRemoveRecord} 
                onEditRecord={setEditingRecord}
                filter={itemFilter}
                onFilterChange={setItemFilter}
              />
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
