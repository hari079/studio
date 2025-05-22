'use server';

/**
 * @fileOverview An AI agent that answers questions about food storage.
 *
 * - foodStorageChatbot - A function that handles the food storage question answering process.
 * - FoodStorageChatbotInput - The input type for the foodStorageChatbot function.
 * - FoodStorageChatbotOutput - The return type for the foodStorageChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodStorageChatbotInputSchema = z.object({
  foodItem: z.string().describe('The food item to get storage advice for.'),
  question: z.string().describe('The question about storing the food item.'),
});
export type FoodStorageChatbotInput = z.infer<typeof FoodStorageChatbotInputSchema>;

const FoodStorageChatbotOutputSchema = z.object({
  storageAdvice: z.string().describe('Advice on how to store the food item, formatted as bullet points.'),
  reasoning: z.string().describe('The reasoning behind the storage advice, formatted as bullet points.'),
});
export type FoodStorageChatbotOutput = z.infer<typeof FoodStorageChatbotOutputSchema>;

export async function foodStorageChatbot(input: FoodStorageChatbotInput): Promise<FoodStorageChatbotOutput> {
  return foodStorageChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodStorageChatbotPrompt',
  input: {schema: FoodStorageChatbotInputSchema},
  output: {schema: FoodStorageChatbotOutputSchema},
  prompt: `You are an expert in food storage and preservation.

  A user has a question about how to store a specific food item.

  Food Item: {{{foodItem}}}
  Question: {{{question}}}

  Respond in a conversational tone.
  Format your 'storageAdvice' as a list of bullet points (e.g., using '-' or '*').
  Format your 'reasoning' as a list of bullet points (e.g., using '-' or '*') explaining why the advice is given.
  `,
});

const foodStorageChatbotFlow = ai.defineFlow(
  {
    name: 'foodStorageChatbotFlow',
    inputSchema: FoodStorageChatbotInputSchema,
    outputSchema: FoodStorageChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
