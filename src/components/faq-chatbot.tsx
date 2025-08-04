'use client';

import { useState, useRef, type FormEvent } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { askQuestion } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = inputRef.current?.value;

    if (!question || isLoading) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    const result = await askQuestion({ question });

    if (result.success && result.answer) {
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer! }]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      // remove the user's message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    }
    setIsLoading(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-110"
          aria-label="Open FAQ Chatbot"
        >
          <Bot className="w-8 h-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            Garena Gears Assistant
          </SheetTitle>
          <SheetDescription>
            Have a question? Ask me anything about our services. For example: "How long do redeem codes take?"
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow pr-4 -mr-6 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-xl p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="bg-muted rounded-xl p-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input ref={inputRef} placeholder="Ask a question..." disabled={isLoading} />
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
