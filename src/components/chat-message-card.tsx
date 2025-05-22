
'use client';

import type { ChatMessage } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removed CardDescription, CardTitle as they are destructured below
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
    const handleEnd = () => setIsSpeaking(false);

    const currentUtterance = utteranceRef.current;
    if (currentUtterance) {
      currentUtterance.addEventListener('end', handleEnd);
    }

    // Cleanup: remove event listener and cancel speech if component unmounts
    return () => {
      if (currentUtterance) {
        currentUtterance.removeEventListener('end', handleEnd);
      }
      if (synth.speaking && utteranceRef.current === currentUtterance) { // Only cancel if it's the current utterance
        synth.cancel();
      }
      setIsSpeaking(false); // Reset speaking state on unmount or utterance change
    };
  }, [utteranceRef.current]); // Rerun effect if utteranceRef.current changes (though it's usually stable)


  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.error('Speech synthesis not supported.');
      return;
    }

    if (isSpeaking) {
      synth.cancel(); // This will trigger the 'end' event, which sets isSpeaking to false.
      // setIsSpeaking(false); // Explicitly set, though 'end' event should handle it.
      return;
    }

    let textToSpeak = '';
    if (message.aiAdvice) textToSpeak += `Advice: ${message.aiAdvice}. `;
    if (message.aiReasoning) textToSpeak += `Reasoning: ${message.aiReasoning}. `;
    if (message.aiHealthBenefits) textToSpeak += `Health Benefits: ${message.aiHealthBenefits}.`;

    if (textToSpeak.trim() === '') {
      if (message.text) textToSpeak = message.text;
      else return; // Nothing to speak
    }
    
    // Cancel any ongoing speech before starting a new one
    if (synth.speaking) {
      synth.cancel();
    }

    const newUtterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = newUtterance; 
    
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => { // This will also be called if synth.cancel() is called
      setIsSpeaking(false);
      if (utteranceRef.current === newUtterance) { // Only clear if it's the same utterance
          utteranceRef.current = null;
      }
    };
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      if (utteranceRef.current === newUtterance) {
          utteranceRef.current = null;
      }
    };
    
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
            <div className={`text-sm font-semibold ${isUser ? 'text-right' : ''}`}> {/* Replaced CardTitle */}
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
                {message.aiAdvice.split('\\n').map((item, index) => item.trim().replace(/^- |^\* /,'') && <li key={`advice-${index}`}>{item.trim().replace(/^- |^\* /,'')}</li>)}
              </ul>
            </div>
          )}
          {message.aiReasoning && (
            <div className="mb-3">
              <p className="font-medium text-base">Reasoning:</p>
               <ul className="list-disc list-inside space-y-1 text-sm whitespace-pre-wrap">
                {message.aiReasoning.split('\\n').map((item, index) => item.trim().replace(/^- |^\* /,'') && <li key={`reasoning-${index}`}>{item.trim().replace(/^- |^\* /,'')}</li>)}
              </ul>
            </div>
          )}
          {message.aiHealthBenefits && (
            <div>
              <p className="font-medium text-base">Health Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-sm whitespace-pre-wrap">
                {message.aiHealthBenefits.split('\\n').map((item, index) => item.trim().replace(/^- |^\* /,'') && <li key={`health-${index}`}>{item.trim().replace(/^- |^\* /,'')}</li>)}
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
