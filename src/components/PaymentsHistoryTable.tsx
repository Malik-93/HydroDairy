
"use client"

import type { PaymentRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Trash2, Droplets, Home, Flower } from 'lucide-react';
import { MilkIcon } from './icons';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from './ui/date-range-picker';

type PaymentsHistoryTableProps = {
  records: PaymentRecord[];
  onRemoveRecord: (id: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  dateRange: { from: Date | null, to: Date | null };
  onDateRangeChange: (date: { from: Date | null, to: Date | null }) => void;
};

const getItemIcon = (item: PaymentRecord['item']) => {
  switch (item) {
    case 'milk':
      return <MilkIcon className="h-3 w-3" />;
    case 'water':
      return <Droplets className="h-3 w-3" />;
    case 'house-cleaning':
      return <Home className="h-3 w-3" />;
    case 'gardener':
      return <Flower className="h-3 w-3" />;
    default:
      return null;
  }
}

export function PaymentsHistoryTable({ records, onRemoveRecord, filter, onFilterChange, dateRange, onDateRangeChange }: PaymentsHistoryTableProps) {
  
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>A log of all your past payments.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <DateRangePicker 
              date={dateRange}
              onDateChange={onDateRangeChange}
              className="w-full sm:w-[300px]"
              placeholder="Filter by date..."
            />
            <Select value={filter} onValueChange={onFilterChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by item..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="milk">Milk</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="house-cleaning">House Cleaning</SelectItem>
                    <SelectItem value="gardener">Gardener</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item / Service</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{format(new Date(record.date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="capitalize flex items-center gap-1 w-fit">
                        {getItemIcon(record.item)}
                        {record.item.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{record.amount.toFixed(2)} PKR</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this payment record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemoveRecord(record.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No payments recorded for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    