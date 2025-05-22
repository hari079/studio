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
  storageAdvice: z.string().describe('Advice on how to store the food item.'),
  reasoning: z.string().describe('The reasoning behind the storage advice.'),
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

  A user has a question about how to store a specific food item.  Provide detailed advice, and explain the reasoning behind your advice.

  Food Item: {{{foodItem}}}
  Question: {{{question}}}

  Respond in a conversational tone.
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
