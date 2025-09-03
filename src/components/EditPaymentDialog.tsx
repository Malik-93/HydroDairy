
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Droplets, Flower, Home, Link as LinkIcon, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { PaymentRecord } from "@/lib/types"
import { useEffect } from "react"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { MilkIcon } from "./icons"
import { ImageKitUploader } from "./ImageKitUploader"
import Image from "next/image"
import Link from "next/link"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  item: z.enum(["milk", "water", "house-cleaning", "gardener"], {
    required_error: "Please select an item.",
  }),
  amount: z.coerce.number().min(0.1, {
    message: "Amount must be greater than 0.",
  }),
  reason: z.string().optional(),
  attachment: z.string().optional(),
});

type EditPaymentDialogProps = {
  record: PaymentRecord;
  onUpdateRecord: (record: PaymentRecord) => Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditPaymentDialog({ record, onUpdateRecord, onOpenChange }: EditPaymentDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    form.reset({
      date: new Date(record.date),
      item: record.item,
      amount: record.amount,
      reason: record.reason || "",
      attachment: record.attachment || "",
    });
  }, [record, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedRecord = {
        ...record,
        ...values,
        date: values.date.toISOString(),
    }
    await onUpdateRecord(updatedRecord);
  }

  const currentAttachment = form.watch('attachment');

  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Payment Record</DialogTitle>
            <DialogDescription>
                Update the details of your payment.
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
                    name="item"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item / Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="milk">
                                <div className="flex items-center gap-2">
                                <MilkIcon className="h-4 w-4" /> Milk
                                </div>
                            </SelectItem>
                            <SelectItem value="water">
                                <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4" /> Water
                                </div>
                            </SelectItem>
                            <SelectItem value="house-cleaning">
                                <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" /> House Cleaning
                                </div>
                            </SelectItem>
                            <SelectItem value="gardener">
                                <div className="flex items-center gap-2">
                                <Flower className="h-4 w-4" /> Gardener
                                </div>
                            </SelectItem>
                            </SelectContent>
                        </Select>
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
                <FormField
                    control={form.control}
                    name="attachment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receipt Attachment</FormLabel>
                             <FormControl>
                                <div>
                                    {currentAttachment ? (
                                        <div className="relative group w-full h-40 rounded-md border overflow-hidden">
                                            <Image src={currentAttachment} alt="Receipt" layout="fill" objectFit="cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={currentAttachment} target="_blank" passHref>
                                                    <Button variant="outline" size="icon" className="text-white">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="destructive" size="icon" className="ml-2" onClick={() => field.onChange("")}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <ImageKitUploader 
                                            onSuccess={(result) => field.onChange(result.url)}
                                            onError={(error) => console.error(error)}
                                        />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" className="transition-all duration-300" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
