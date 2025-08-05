"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getReorderReminders } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb } from "lucide-react";

const reminderSchema = z.object({
  deliverySchedule: z.string().min(10, "Please describe your delivery schedule."),
  consumptionPatterns: z.string().min(10, "Please describe your consumption patterns."),
});

type ReminderCardProps = {
  daysWithoutDelivery: {
    milk: number | null;
    water: number | null;
  };
};

export function ReminderCard({ daysWithoutDelivery }: ReminderCardProps) {
  const [reminders, setReminders] = useState<{ milkReorderReminder: string; waterReorderReminder: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      deliverySchedule: "Daily delivery for milk, twice a week for water (Monday, Friday).",
      consumptionPatterns: "We consume about 1KG of milk daily and bottels as per needed twice a week.",
    },
  });

  async function onSubmit(values: z.infer<typeof reminderSchema>) {
    setIsLoading(true);
    setReminders(null);
    try {
      const result = await getReorderReminders({
        ...values,
        daysWithoutDeliveryMilk: daysWithoutDelivery.milk ?? 0,
        daysWithoutDeliveryWater: daysWithoutDelivery.water ?? 0,
      });
      setReminders(result);
      toast({
        title: "Reminders Generated!",
        description: "AI has created new reorder reminders for you.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error instanceof Error ? error.message : "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>AI Reorder Reminders</CardTitle>
            <CardDescription>Generate automatic reorder reminders based on your schedule and consumption.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="deliverySchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Schedule</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Milk daily, water on Tuesdays..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consumptionPatterns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumption Patterns</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., We use 2L of milk per day..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {reminders && (
              <div className="space-y-2 pt-4">
                <Alert className="bg-accent/50 border-accent/80">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Milk Reminder</AlertTitle>
                  <AlertDescription>{reminders.milkReorderReminder}</AlertDescription>
                </Alert>
                <Alert className="bg-primary/30 border-primary/50">
                   <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Water Reminder</AlertTitle>
                  <AlertDescription>{reminders.waterReorderReminder}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full transition-all duration-300">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Generating..." : "Generate Reminders"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
