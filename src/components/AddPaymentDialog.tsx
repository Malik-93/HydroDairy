
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Item, PaymentRecord } from "@/lib/types"
import { useEffect } from "react"
import { Textarea } from "./ui/textarea"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  amount: z.coerce.number().min(0.1, {
    message: "Amount must be greater than 0.",
  }),
  reason: z.string().optional(),
});

type AddPaymentDialogProps = {
  item: Item,
  onAddPayment: (payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
  prefilledAmount?: number;
}

export function AddPaymentDialog({ item, onAddPayment, onOpenChange, prefilledAmount = 0 }: AddPaymentDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    form.reset({
      date: new Date(),
      amount: prefilledAmount > 0 ? prefilledAmount : 0,
      reason: "",
    });
  }, [item, form, prefilledAmount]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddPayment({
        item: item,
        amount: values.amount,
        date: values.date.toISOString(),
        reason: values.reason,
    });
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Add Payment for <span className="capitalize">{item.replace('-', ' ')}</span></DialogTitle>
            <DialogDescription>
                Enter the amount you have paid. This will be deducted from your total bill for this service.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Payment Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount (PKR)</FormLabel>
                    <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., Advance payment for June" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" className="transition-all duration-300" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Add Payment'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
