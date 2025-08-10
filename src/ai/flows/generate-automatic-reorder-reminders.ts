'use server';
/**
 * @fileOverview A flow that generates automatic reorder reminders for milk and water.
 *
 * - generateReorderReminders - A function that generates reorder reminders based on delivery schedule and consumption patterns.
 * - GenerateReorderRemindersInput - The input type for the generateReorderReminders function.
 * - GenerateReorderRemindersOutput - The return type for the generateReorderReminders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReorderRemindersInputSchema = z.object({
  deliverySchedule: z
    .string()
    .describe(
      'A string describing the delivery schedule, including days of the week and frequency for milk, water, house cleaning, and gardener.'
    ),
  consumptionPatterns: z
    .string()
    .describe(
      'A description of the typical consumption patterns for milk and water, including average daily usage.'
    ),
  daysWithoutDeliveryMilk: z.number().describe('Number of days without milk delivery.'),
  daysWithoutDeliveryWater: z.number().describe('Number of days without water delivery.'),
});
export type GenerateReorderRemindersInput = z.infer<
  typeof GenerateReorderRemindersInputSchema
>;

const GenerateReorderRemindersOutputSchema = z.object({
  milkReorderReminder: z
    .string()
    .describe('A reminder message for reordering milk.'),
  waterReorderReminder: z
    .string()
    .describe('A reminder message for reordering water.'),
});
export type GenerateReorderRemindersOutput = z.infer<
  typeof GenerateReorderRemindersOutputSchema
>;

export async function generateReorderReminders(
  input: GenerateReorderRemindersInput
): Promise<GenerateReorderRemindersOutput> {
  return generateReorderRemindersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReorderRemindersPrompt',
  input: {schema: GenerateReorderRemindersInputSchema},
  output: {schema: GenerateReorderRemindersOutputSchema},
  prompt: `You are a helpful assistant that generates reorder reminders for milk and water based on delivery schedule and consumption patterns. You also consider schedules for house cleaning and gardener.

  Delivery Schedule: {{{deliverySchedule}}}
  Consumption Patterns: {{{consumptionPatterns}}}
  Days Without Milk Delivery: {{{daysWithoutDeliveryMilk}}}
  Days Without Water Delivery: {{{daysWithoutDeliveryWater}}}

  Generate a reminder message for milk and water separately, considering the provided information.
  The reminder messages should be concise and actionable.

  Output in JSON format:
  {
    "milkReorderReminder": "reminder message for reordering milk",
    "waterReorderReminder": "reminder message for reordering water"
  }`,
});

const generateReorderRemindersFlow = ai.defineFlow(
  {
    name: 'generateReorderRemindersFlow',
    inputSchema: GenerateReorderRemindersInputSchema,
    outputSchema: GenerateReorderRemindersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
