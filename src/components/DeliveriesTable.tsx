"use client"

import type { DeliveryRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Trash2, Droplets, Pencil, Home, Flower } from 'lucide-react';
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


type DeliveriesTableProps = {
  records: DeliveryRecord[];
  onRemoveRecord: (id: string) => void;
  onEditRecord: (record: DeliveryRecord) => void;
  filter: string;
  onFilterChange: (value: string) => void;
};

const getItemIcon = (item: DeliveryRecord['item']) => {
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

export function DeliveriesTable({ records, onRemoveRecord, onEditRecord, filter, onFilterChange }: DeliveriesTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Delivery History</CardTitle>
            <CardDescription>A log of all your past deliveries and services.</CardDescription>
        </div>
        <div className="w-48">
            <Select value={filter} onValueChange={onFilterChange}>
                <SelectTrigger>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity / Visits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{format(new Date(record.date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={record.item === 'milk' ? 'secondary' : record.item === 'water' ? 'default' : record.item === 'house-cleaning' ? 'outline' : 'destructive'} className="capitalize flex items-center gap-1 w-fit">
                        {getItemIcon(record.item)}
                        {record.item.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'delivered' ? 'outline' : 'destructive'} className="capitalize">
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{record.quantity.toFixed(record.item === 'milk' || record.item === 'water' ? 2 : 0)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => onEditRecord(record)}>
                          <Pencil className="h-4 w-4" />
                       </Button>
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
                              This action cannot be undone. This will permanently delete this delivery record.
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    No deliveries recorded for this filter.
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
