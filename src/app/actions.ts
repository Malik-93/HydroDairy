"use server";

import { generateReorderReminders } from "@/ai/flows/generate-automatic-reorder-reminders";
import type { GenerateReorderRemindersInput } from "@/ai/flows/generate-automatic-reorder-reminders";
import { z } from "zod";

const ActionInputSchema = z.object({
  deliverySchedule: z.string(),
  consumptionPatterns: z.string(),
  daysWithoutDeliveryMilk: z.number(),
  daysWithoutDeliveryWater: z.number(),
});

export async function getReorderReminders(input: GenerateReorderRemindersInput) {
  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("Invalid input for generating reminders.");
  }
  
  try {
    const reminders = await generateReorderReminders(parsedInput.data);
    return reminders;
  } catch (error) {
    console.error("Error generating reminders:", error);
    throw new Error("Failed to generate AI reminders. Please try again.");
  }
}
