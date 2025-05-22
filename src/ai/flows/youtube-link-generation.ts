
'use server';

/**
 * @fileOverview Generates a YouTube search query and then fetches a video link using the YouTube API.
 *
 * - generateYoutubeLink - A function that generates a YouTube video link.
 * - GenerateYoutubeLinkInput - The input type for the generateYoutubeLink function.
 * - GenerateYoutubeLinkOutput - The return type for the generateYoutubeLink function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchFirstYouTubeVideo } from '@/services/youtube-service';

const GenerateYoutubeLinkInputSchema = z.object({
  foodItem: z.string().describe('The specific food item the user is asking about.'),
  question: z.string().describe('The specific question the user has about the food item.'),
});
export type GenerateYoutubeLinkInput = z.infer<typeof GenerateYoutubeLinkInputSchema>;

const GenerateYoutubeLinkOutputSchema = z.object({
  searchQueryUsed: z.string().optional().describe('The search query string that was generated and used to find the video.'),
  videoUrl: z
    .string()
    .optional()
    .describe('A direct YouTube video URL relevant to the food item and question, if a suitable and available video is found.'),
});
export type GenerateYoutubeLinkOutput = z.infer<typeof GenerateYoutubeLinkOutputSchema>;

// Renamed from generateYoutubeSearchQuery to generateYoutubeLink
export async function generateYoutubeLink(input: GenerateYoutubeLinkInput): Promise<GenerateYoutubeLinkOutput> {
  return generateYoutubeLinkFlow(input);
}

const searchQueryPrompt = ai.definePrompt({
  name: 'youtubeSearchQueryGenerationPrompt', // Keep name for continuity or rename if preferred
  input: {schema: GenerateYoutubeLinkInputSchema},
  output: {schema: z.object({ searchQuery: z.string().describe('A concise and effective YouTube search query string.') })},
  prompt: `You are an expert YouTube search curator specializing in food storage and preparation.
Given a food item and a question, your task is to generate **one single, highly effective YouTube search query string**.
This query should be optimized to find practical, helpful, and currently available videos.

Focus on creating a query that would yield the best video results if typed directly into YouTube.
Consider keywords, common phrases, and the user's likely intent.

User's Food Item: "{{{foodItem}}}"
User's Question: "{{{question}}}"

Example:
If Food Item is "avocado" and Question is "how to stop it from browning", a good search query is "how to keep avocado from browning".
If Food Item is "berries" and Question is "best way to wash and store", a good search query is "wash and store berries to last longer".
If Food Item is "chicken breast" and Question is "how to tell if it's cooked through", a good search query is "check if chicken breast is cooked".

Generate ONLY the search query string.
`,
});

const generateYoutubeLinkFlow = ai.defineFlow(
  {
    name: 'generateYoutubeLinkFlow', // Renamed flow
    inputSchema: GenerateYoutubeLinkInputSchema,
    outputSchema: GenerateYoutubeLinkOutputSchema,
  },
  async (input: GenerateYoutubeLinkInput) => {
    // Step 1: Generate the search query using the LLM
    const { output: searchQueryOutput } = await searchQueryPrompt(input);
    if (!searchQueryOutput?.searchQuery) {
      console.log('LLM failed to generate a search query.');
      return { videoUrl: undefined, searchQueryUsed: undefined };
    }
    const { searchQuery } = searchQueryOutput;

    // Step 2: Use the generated search query to fetch a video link via the YouTube API
    const videoUrl = await fetchFirstYouTubeVideo(searchQuery);

    if (videoUrl) {
      return { videoUrl, searchQueryUsed: searchQuery };
    } else {
      console.log(`No video found via YouTube API for query: "${searchQuery}"`);
      return { videoUrl: undefined, searchQueryUsed: searchQuery };
    }
  }
);
