'use client';

import type { ChatMessage } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageCardProps {
  message: ChatMessage;
}

export function ChatMessageCard({ message }: ChatMessageCardProps) {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''} my-4`}>
      {!isUser && !isSystem && (
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className={isError ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}>
            {isError ? <AlertTriangle size={20} /> : <Bot size={20} />}
          </AvatarFallback>
        </Avatar>
      )}
      <Card className={`max-w-xl shadow-md ${isUser ? 'bg-primary text-primary-foreground' : isError ? 'bg-destructive/10 border-destructive' : 'bg-card'}`}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className={`text-sm font-semibold ${isUser ? 'text-right' : ''}`}>
            {isUser ? 'You' : isError ? 'Error' : isSystem ? 'Food Assist Guide' : 'Food Assist AI'}
            {message.foodItem && message.originalQuestion && isUser && (
              <span className="block text-xs font-normal opacity-80 mt-1">
                Asked about: {message.foodItem} - "{message.originalQuestion}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {message.aiAdvice && (
            <div className="mb-2">
              <p className="font-medium">Advice:</p>
              <p className="whitespace-pre-wrap">{message.aiAdvice}</p>
            </div>
          )}
          {message.aiReasoning && (
            <div>
              <p className="font-medium">Reasoning:</p>
              <p className="whitespace-pre-wrap">{message.aiReasoning}</p>
            </div>
          )}
          {!message.aiAdvice && !message.aiReasoning && (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
           <p className={`text-xs mt-2 opacity-70 ${isUser ? 'text-right' : ''}`}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
      {isUser && (
         <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User size={20}/>
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
