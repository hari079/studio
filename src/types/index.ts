export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'error' | 'system';
  text: string;
  foodItem?: string;
  originalQuestion?: string;
  aiAdvice?: string;
  aiReasoning?: string;
  timestamp: Date;
}
