
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';
import { foodStorageChatbot } from '@/ai/flows/food-storage-chatbot';
import { generateYoutubeLinks } from '@/ai/flows/youtube-link-generation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChatMessageCard } from '@/components/chat-message-card';
import { YouTubeLinkCard } from '@/components/youtube-link-card';
import { Loader2, Send, AlertTriangle, Wand2, Youtube, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const chatInputSchema = z.object({
  foodItem: z.string().min(1, { message: 'Food item cannot be empty.' }),
  question: z.string().min(5, { message: 'Question must be at least 5 characters long.' }),
});
type ChatInputForm = z.infer<typeof chatInputSchema>;

export function FoodSavvyApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-greeting',
      type: 'system',
      text: 'Welcome to FoodSavvy! Tell me about a food item and your storage question for it. For example, "Apples" and "How to keep them fresh longest?".',
      timestamp: new Date(),
    }
  ]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
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

  const formatChatHistoryForAI = (history: ChatMessage[]): string => {
    return history
      .map(msg => {
        if (msg.type === 'user') {
          return `User: (Food: ${msg.foodItem}) ${msg.originalQuestion}`;
        } else if (msg.type === 'ai') {
          return `AI: (Advice: ${msg.aiAdvice}) (Reasoning: ${msg.aiReasoning})`;
        }
        return ''; // Ignore system/error messages for this specific formatting
      })
      .filter(Boolean)
      .join('\n');
  };

  const onSubmit: SubmitHandler<ChatInputForm> = async (data) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      text: `${data.foodItem}: ${data.question}`,
      foodItem: data.foodItem,
      originalQuestion: data.question,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    form.reset();

    try {
      // Get food storage advice
      const aiResponse = await foodStorageChatbot({ foodItem: data.foodItem, question: data.question });
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        text: '', // Main text not used if advice/reasoning present
        aiAdvice: aiResponse.storageAdvice,
        aiReasoning: aiResponse.reasoning,
        timestamp: new Date(),
      };
      const updatedMessagesWithAI = [...newMessages, aiMessage];
      setMessages(updatedMessagesWithAI);

      // Generate YouTube links based on the new chat history
      const chatHistoryString = formatChatHistoryForAI(updatedMessagesWithAI);
      if (chatHistoryString) {
        const linksResponse = await generateYoutubeLinks({ chatHistory: chatHistoryString });
        setYoutubeLinks(linksResponse.videoLinks);
        if (linksResponse.videoLinks.length > 0) {
            toast({
                title: "YouTube Links Found!",
                description: "We've found some related videos for you.",
                duration: 3000,
            });
        }
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
              Chat with FoodSavvy AI
            </CardTitle>
            <CardDescription>Ask about storing any food item, and get expert advice.</CardDescription>
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
                        <span className="ml-2 text-sm text-muted-foreground">FoodSavvy AI is typing...</span>
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
                          <Input placeholder="e.g., Strawberries, Bread, Cheese" {...field} disabled={isLoading} />
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
                          <Textarea placeholder="e.g., How to prevent mold? Best way to freeze?" {...field} disabled={isLoading} className="min-h-[40px] md:min-h-[auto]" rows={1}/>
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
                      Get Storage Advice
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
              Related Videos
            </CardTitle>
            <CardDescription>Helpful YouTube videos based on your chat.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {youtubeLinks.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-3">
                  {youtubeLinks.map((link, index) => (
                    <YouTubeLinkCard key={index} url={link} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isLoading && messages.length > 1 ? 'Searching for videos...' : 'No videos generated yet. Ask a question to see related content!'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
