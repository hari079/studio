
'use server';

/**
 * @fileOverview An AI agent that answers questions about food storage, provides reasoning, and health benefits.
 *
 * - foodStorageChatbot - A function that handles the food-related question answering process.
 * - FoodStorageChatbotInput - The input type for the foodStorageChatbot function.
 * - FoodStorageChatbotOutput - The return type for the foodStorageChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodStorageChatbotInputSchema = z.object({
  foodItem: z.string().describe('The food item to get advice for (e.g., apple, broccoli, bread).'),
  question: z.string().describe('The question about the food item, which could be about storage, preparation, or general queries.'),
});
export type FoodStorageChatbotInput = z.infer<typeof FoodStorageChatbotInputSchema>;

const FoodStorageChatbotOutputSchema = z.object({
  storageAdvice: z.string().describe('Advice on how to handle or store the food item, formatted as bullet points.'),
  reasoning: z.string().describe('The reasoning behind the advice, formatted as bullet points.'),
  healthBenefits: z.string().describe('Key health benefits of the food item, formatted as bullet points.'),
});
export type FoodStorageChatbotOutput = z.infer<typeof FoodStorageChatbotOutputSchema>;

export async function foodStorageChatbot(input: FoodStorageChatbotInput): Promise<FoodStorageChatbotOutput> {
  return foodStorageChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodStorageChatbotPrompt',
  input: {schema: FoodStorageChatbotInputSchema},
  output: {schema: FoodStorageChatbotOutputSchema},
  prompt: `You are an expert in food science, nutrition, and culinary arts, specializing in fruits, vegetables, and common household food items.

  A user has a question about a specific food item.

  Food Item: {{{foodItem}}}
  User's Question: {{{question}}}

  Your response should cover three aspects:
  1.  **Storage Advice:** Provide practical advice related to the user's question (e.g., storage, preparation, how to tell if it's ripe/bad).
  2.  **Reasoning:** Explain the "why" behind your advice.
  3.  **Health Benefits:** Briefly list key health benefits of the food item.

  Respond in a conversational and helpful tone.
  Format your 'storageAdvice' as a list of bullet points (e.g., using '-' or '*').
  Format your 'reasoning' as a list of bullet points (e.g., using '-' or '*').
  Format your 'healthBenefits' as a list of bullet points (e.g., using '-' or '*').

  Example for Food Item "Avocado" and Question "How to store it after cutting?":
  storageAdvice:
  - Store cut avocado in an airtight container.
  - Sprinkle with lemon or lime juice before storing.
  - Alternatively, press plastic wrap directly onto the cut surface.
  reasoning:
  - Airtight containers limit oxygen exposure, slowing down browning.
  - Citric acid from lemon/lime juice inhibits the enzyme that causes browning.
  - Plastic wrap creates a barrier against air.
  healthBenefits:
  - Rich in healthy monounsaturated fats.
  - Good source of fiber, potassium, and Vitamin K.
  - Contains antioxidants like lutein.
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
