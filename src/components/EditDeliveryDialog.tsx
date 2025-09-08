"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Droplets, Home, Flower, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { DeliveryRecord } from "@/lib/types"
import { MilkIcon } from "./icons"
import { useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  item: z.enum(["milk", "water", "house-cleaning", "gardener"], {
    required_error: "Please select an item.",
  }),
  quantity: z.coerce.number().min(0.1, {
    message: "Quantity must be greater than 0.",
  }),
  billedQuantity: z.coerce.number().optional(),
  status: z.enum(["delivered", "returned"]),
});

type EditDeliveryDialogProps = {
  record: DeliveryRecord;
  onUpdateRecord: (record: DeliveryRecord) => Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditDeliveryDialog({ record, onUpdateRecord, onOpenChange }: EditDeliveryDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(record.date),
      item: record.item,
      quantity: record.quantity,
      billedQuantity: record.billedQuantity,
      status: record.status,
    },
  });

  useEffect(() => {
    form.reset({
      date: new Date(record.date),
      item: record.item,
      quantity: Math.abs(record.quantity), // show positive number in form
      billedQuantity: record.billedQuantity,
      status: record.status,
    });
  }, [record, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedRecord = {
      ...record,
      ...values,
      date: values.date.toISOString(),
      quantity: values.quantity,
      billedQuantity: values.billedQuantity || undefined,
    };
    await onUpdateRecord(updatedRecord);
    toast({
      title: "Success!",
      description: `Updated delivery record.`,
    });
  }

  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
                Update the details of your record.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="delivered" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Delivered / Done
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="returned" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Returned / Canceled
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Delivered Quantity</FormLabel>
                      <FormControl>
                          <Input type="number" step="1" placeholder="e.g., 1.5" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="billedQuantity"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-1">
                          Billed Quantity
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-pointer"/>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Leave empty to use delivered quantity.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormLabel>
                      <FormControl>
                          <Input type="number" step="1" placeholder="e.g., 1.0" {...field} value={field.value ?? ''}/>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                </div>
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
