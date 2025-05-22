
'use client';

import type { ChatMessage } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

interface ChatMessageCardProps {
  message: ChatMessage;
}

export function ChatMessageCard({ message }: ChatMessageCardProps) {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';
  const isAI = message.type === 'ai';

  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    // This cleanup function will run when the component unmounts.
    return () => {
      // If speech is active when the component unmounts, cancel it.
      // This will trigger onend or onerror for the utterance.
      if (utteranceRef.current && synth.speaking) {
        synth.cancel();
      }
      // Ensure this component's state is reset on unmount,
      // regardless of whether onend/onerror fired immediately.
      setIsSpeaking(false); 
      utteranceRef.current = null;
    };
  }, []); // Empty dependency array: runs once on mount for cleanup registration.


  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.error('Speech synthesis not supported.');
      return;
    }

    // If already speaking (this card's utterance), stop the speech
    if (isSpeaking && utteranceRef.current) {
      synth.cancel(); // This will trigger utteranceRef.current.onend or .onerror
      // State updates (isSpeaking, utteranceRef) are handled by onend/onerror
      return;
    }

    // If not currently speaking, start new speech
    let textToSpeak = '';
    if (message.aiAdvice) textToSpeak += `Advice: ${message.aiAdvice}. `;
    if (message.aiReasoning) textToSpeak += `Reasoning: ${message.aiReasoning}. `;
    if (message.aiHealthBenefits) textToSpeak += `Health Benefits: ${message.aiHealthBenefits}.`;

    if (textToSpeak.trim() === '') {
      if (message.text) textToSpeak = message.text;
      else return; // Nothing to speak
    }
    
    // Cancel any *other* ongoing speech from other cards/sources before starting a new one
    if (synth.speaking) {
      synth.cancel(); // This will trigger onend/onerror for any currently speaking utterance(s)
    }

    const newUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    newUtterance.onstart = () => {
        setIsSpeaking(true);
    };
    newUtterance.onend = () => { 
      setIsSpeaking(false);
      // Only clear the ref if it's this utterance that ended
      if (utteranceRef.current === newUtterance) {
          utteranceRef.current = null;
      }
    };
    newUtterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.info('Speech synthesis stopped:', event.error, 'Full event:', event);
      } else {
        console.error('Speech synthesis error reason:', event.error, 'Full event:', event);
      }
      setIsSpeaking(false);
      if (utteranceRef.current === newUtterance) {
          utteranceRef.current = null;
      }
    };
    
    utteranceRef.current = newUtterance; 
    synth.speak(newUtterance);
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
          <div className="flex justify-between items-center">
            <div className={`text-sm font-semibold ${isUser ? 'text-right' : ''}`}>
              {isUser ? 'You' : isError ? 'Error' : isSystem ? 'Food Assist Guide' : 'Food Assist AI'}
              {message.foodItem && message.originalQuestion && isUser && (
                <span className="block text-xs font-normal opacity-80 mt-1">
                  Asked about: {message.foodItem} - "{message.originalQuestion}"
                </span>
              )}
            </div>
            {isAI && (message.aiAdvice || message.aiReasoning || message.aiHealthBenefits) && (
              <Button variant="ghost" size="icon" onClick={handleSpeak} className="h-8 w-8 text-current hover:bg-accent/10">
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span className="sr-only">{isSpeaking ? 'Stop speaking' : 'Speak advice'}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {message.aiAdvice && (
            <div className="mb-3">
              <p className="font-medium text-base">Advice:</p>
              <ul className="list-disc list-inside space-y-1 text-sm whitespace-pre-wrap">
                {message.aiAdvice.split('\\n').map((item, index) => {
                  const trimmedItem = item.trim().replace(/^- |^\* /,'');
                  return trimmedItem && <li key={`advice-${index}`}>{trimmedItem}</li>;
                })}
              </ul>
            </div>
          )}
          {message.aiReasoning && (
            <div className="mb-3">
              <p className="font-medium text-base">Reasoning:</p>
               <ul className="list-disc list-inside space-y-1 text-sm whitespace-pre-wrap">
                {message.aiReasoning.split('\\n').map((item, index) => {
                  const trimmedItem = item.trim().replace(/^- |^\* /,'');
                  return trimmedItem && <li key={`reasoning-${index}`}>{trimmedItem}</li>;
                })}
              </ul>
            </div>
          )}
          {message.aiHealthBenefits && (
            <div>
              <p className="font-medium text-base">Health Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-sm whitespace-pre-wrap">
                {message.aiHealthBenefits.split('\\n').map((item, index) => {
                  const trimmedItem = item.trim().replace(/^- |^\* /,'');
                  return trimmedItem && <li key={`health-${index}`}>{trimmedItem}</li>;
                })}
              </ul>
            </div>
          )}
          {!message.aiAdvice && !message.aiReasoning && !message.aiHealthBenefits && (
            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
          )}
           <p className={`text-xs mt-3 opacity-70 ${isUser ? 'text-right' : ''}`}>
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
