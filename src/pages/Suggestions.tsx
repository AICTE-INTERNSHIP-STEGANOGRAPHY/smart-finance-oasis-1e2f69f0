
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/hooks/useCurrency";

interface Suggestion {
  id: number;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Suggestions() {
  const { currencySymbol } = useCurrency();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 1,
      message: `Welcome to AI Finance Assistant! Ask me any finance-related question, and I'll provide personalized advice to help you manage your finances better. I can help with budgeting, saving strategies, or investment tips based on your financial goals.`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Suggestion = {
      id: suggestions.length + 1,
      message: query,
      isUser: true,
      timestamp: new Date(),
    };
    
    setSuggestions([...suggestions, userMessage]);
    setQuery("");
    setLoading(true);
    
    // Mock AI response after a short delay
    setTimeout(() => {
      const responses = [
        `Based on your spending patterns, I've noticed you spend 30% of your income on food. Consider meal planning to reduce this to 15-20%, which could save you ${currencySymbol}200 monthly.`,
        `Looking at your recurring subscriptions, you could save ${currencySymbol}45 monthly by consolidating streaming services or using family plans.`,
        `Your savings rate is currently 10%. To reach financial independence faster, aim for 20-25% by automatically transferring funds on payday.`,
        `Consider investing in low-cost index funds for long-term wealth building. Starting with just ${currencySymbol}100 monthly could grow to ${currencySymbol}40,000+ over 15 years.`,
        `Your emergency fund covers 2 months of expenses. Financial experts recommend 3-6 months. Try increasing it by setting aside an extra ${currencySymbol}100 monthly.`
      ];
      
      const aiResponse: Suggestion = {
        id: suggestions.length + 2,
        message: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };
      
      setSuggestions(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Finance Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized financial advice and suggestions
        </p>
      </div>
      
      <Card className="flex-1 flex flex-col mt-6 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Financial Assistant</CardTitle>
          <CardDescription>
            Ask any finance-related questions for personalized advice
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] p-4">
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`flex ${suggestion.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex gap-3 max-w-[80%]">
                    {!suggestion.isUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <DollarSign className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        suggestion.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{suggestion.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {suggestion.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {suggestion.isUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted">U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <DollarSign className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="pt-2">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Textarea
              placeholder="Ask how to improve your finances..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 resize-none"
              rows={2}
            />
            <Button type="submit" disabled={loading}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
