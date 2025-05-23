
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';
import { foodStorageChatbot } from '@/ai/flows/food-storage-chatbot';
import { generateYoutubeLink } from '@/ai/flows/youtube-link-generation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChatMessageCard } from '@/components/chat-message-card';
import { Loader2, Send, AlertTriangle, Wand2, Youtube, Bot, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const chatInputSchema = z.object({
  foodItem: z.string().min(1, { message: 'Food item cannot be empty.' }),
  question: z.string().min(5, { message: 'Question must be at least 5 characters long.' }),
});
type ChatInputForm = z.infer<typeof chatInputSchema>;

export function FoodAssistApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-greeting',
      type: 'system',
      text: 'Welcome to Food Assist! Ask me about any food item for storage tips, why those tips work, its health benefits, and a relevant YouTube video.',
      timestamp: new Date(),
    }
  ]);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState<string | null>(null);
  const [youtubeSearchQueryUsed, setYoutubeSearchQueryUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<ChatInputForm>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      foodItem: '',
      question: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const onSubmit: SubmitHandler<ChatInputForm> = async (data) => {
    setIsLoading(true);
    setError(null);
    setYoutubeVideoUrl(null); // Clear previous video URL
    setYoutubeSearchQueryUsed(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      text: `${data.foodItem}: ${data.question}`,
      foodItem: data.foodItem,
      originalQuestion: data.question,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    form.reset();

    try {
      // Get food storage advice, reasoning, and health benefits
      const aiResponsePromise = foodStorageChatbot({ foodItem: data.foodItem, question: data.question });
      // Generate YouTube link
      const youtubeLinkPromise = generateYoutubeLink({ foodItem: data.foodItem, question: data.question });

      const [aiResponse, youtubeLinkResponse] = await Promise.all([aiResponsePromise, youtubeLinkPromise]);
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        text: '', 
        aiAdvice: aiResponse.storageAdvice,
        aiReasoning: aiResponse.reasoning,
        aiHealthBenefits: aiResponse.healthBenefits,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      setYoutubeVideoUrl(youtubeLinkResponse.videoUrl || null);
      setYoutubeSearchQueryUsed(youtubeLinkResponse.searchQueryUsed || null);

      if (youtubeLinkResponse.videoUrl) {
          toast({
              title: "Related YouTube Video Found!",
              description: "Check the 'Related Video' section.",
              duration: 4000,
          });
      } else if (youtubeLinkResponse.searchQueryUsed) {
          toast({
              title: "Video Suggestion",
              description: `We couldn't find a direct video match. You can try the generated search query on YouTube.`,
              variant: "default",
              duration: 5000,
          });
      } else {
          toast({
              title: "YouTube Search",
              description: "Could not generate a YouTube video suggestion for this query.",
              variant: "default",
              duration: 4000,
          });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorMessageObj: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'error',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process your request.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3 flex flex-col">
        <Card className="flex-grow flex flex-col shadow-xl overflow-hidden">
          <CardHeader className="p-4 md:p-6 border-b">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Wand2 className="h-6 w-6 text-primary" />
              Chat with Food Assist AI
            </CardTitle>
            <CardDescription>Ask about any food item for storage advice, reasoning, health benefits, and a related video.</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-grow p-4 md:p-6" viewportRef={scrollAreaRef}>
            <div className="space-y-4 min-h-[300px]">
              {messages.map((msg) => (
                <ChatMessageCard key={msg.id} message={msg} />
              ))}
              {isLoading && messages[messages.length -1]?.type === 'user' && (
                 <div className="flex items-start gap-3 my-4">
                    <div className="bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center border border-border">
                        <Bot size={20} />
                    </div>
                    <Card className="max-w-xl shadow-md bg-card p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Food Assist AI is thinking...</span>
                    </Card>
                 </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4 md:p-6 bg-background/80">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="foodItem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Item</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Apples, Spinach, Chicken" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., How to store to keep fresh? Best way to freeze for later?" {...field} disabled={isLoading} className="min-h-[40px] md:min-h-[auto]" rows={1}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Advice...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Get Food Advice
                    </>
                  )}
                </Button>
              </form>
            </Form>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:w-1/3">
        <Card className="shadow-xl">
          <CardHeader className="p-4 md:p-6 border-b">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Youtube className="h-6 w-6 text-red-600" />
              Related Video
            </CardTitle>
            <CardDescription>A suggested YouTube video or search query for your question.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 min-h-[150px] flex flex-col justify-center">
            {isLoading && messages[messages.length -1]?.type === 'user' ? (
                 <p className="text-sm text-center text-muted-foreground">Searching for video...</p>
            ): youtubeVideoUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Here's a related video:
                </p>
                 <div className="p-3 bg-muted rounded-md shadow-sm break-words">
                    <a href={youtubeVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-primary line-clamp-2" title={youtubeVideoUrl}>
                        {youtubeVideoUrl}
                    </a>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <a
                    href={youtubeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch on YouTube
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : youtubeSearchQueryUsed ? (
              <div className="space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  No direct video match found for the query:
                </p>
                <div className="p-2 bg-muted/60 rounded-md shadow-sm break-words inline-block">
                    <span className="text-sm text-primary font-medium">
                        "{youtubeSearchQueryUsed}"
                    </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeSearchQueryUsed)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Search this query on YouTube
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground pt-1">
                  You can also try a broader question in the chat.
                </p>
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Ask a question to get a YouTube video suggestion!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
