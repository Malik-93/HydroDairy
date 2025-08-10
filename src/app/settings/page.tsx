
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getRates, updateRates } from '@/lib/firestore';
import type { Rates } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_RATES } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ratesSchema = z.object({
  milk: z.coerce.number().min(0, "Rate must be positive"),
  water: z.coerce.number().min(0, "Rate must be positive"),
  'house-cleaning': z.coerce.number().min(0, "Rate must be positive"),
  gardener: z.coerce.number().min(0, "Rate must be positive"),
});

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ratesSchema>>({
    resolver: zodResolver(ratesSchema),
    defaultValues: DEFAULT_RATES,
  });

  useEffect(() => {
    async function fetchRates() {
      try {
        const rates = await getRates();
        if (rates) {
          form.reset(rates);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching rates',
          description: 'Could not load the current rates from the database.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchRates();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof ratesSchema>) {
    try {
      await updateRates(values);
      toast({
        title: 'Success!',
        description: 'Service rates have been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error saving rates',
        description: 'Could not save the new rates. Please try again.',
      });
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between">
          <Link href="/">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <div/>
      </header>
      <main className="flex flex-1 justify-center items-start p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Manage Service Rates</CardTitle>
            <CardDescription>Update the prices for milk, water, and other services. These rates will be used to calculate your bill.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <p>Loading rates...</p>
             ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="milk"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Milk Rate (per KG)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="water"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Water Rate (per Bottle)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="house-cleaning"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>House Cleaning (per Visit)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="gardener"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gardener (per Visit)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
