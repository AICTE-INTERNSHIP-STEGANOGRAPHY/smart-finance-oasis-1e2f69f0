
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, User, Bot, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function Suggestions() {
  const { currency } = useCurrency();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("aiAssistantMessages");
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: "welcome",
        content: "Hello! I'm your AI Finance Assistant. How can I help you with your financial planning today?",
        sender: "assistant",
        timestamp: new Date()
      }
    ];
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("aiAssistantMessages", JSON.stringify(messages));
  }, [messages]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI thinking
    setTimeout(() => {
      // Get financial data for context
      const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
      const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
      const savingsGoals = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
      
      const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const totalIncome = incomes.reduce((sum: number, inc: any) => sum + inc.amount, 0);
      const totalSavings = savingsGoals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0);
      
      // Generate personalized response based on user input and financial data
      let response = "";
      const query = input.toLowerCase();
      
      if (query.includes("budget") || query.includes("spending")) {
        if (expenses.length === 0) {
          response = "You haven't recorded any expenses yet. Start by adding your expenses in the Expenditures section to get insights on your spending habits.";
        } else {
          const topCategory = expenses
            .reduce((acc: Record<string, number>, exp: any) => {
              acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
              return acc;
            }, {});
          
          const sortedCategories = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
          const topSpending = sortedCategories[0];
          
          const expenseCategories = JSON.parse(localStorage.getItem("expenseCategories") || "[]");
          const topCategoryName = expenseCategories.find((cat: any) => cat.value === topSpending?.[0])?.label || topSpending?.[0];
          
          response = `Based on your spending records, your highest expense category is ${topCategoryName} at ${formatMoney(topSpending?.[1] || 0, currency)}. This represents ${Math.round((topSpending?.[1] / totalExpenses) * 100)}% of your total expenses. Would you like some tips on how to reduce spending in this category?`;
        }
      } 
      else if (query.includes("saving") || query.includes("save money")) {
        if (totalIncome === 0) {
          response = "I don't see any income records yet. Add your income sources first, so I can help you create a saving plan.";
        } else if (totalExpenses === 0) {
          response = "You haven't recorded any expenses yet. To give you personalized saving advice, I need to understand your spending patterns.";
        } else {
          const savingRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
          
          if (savingRate < 0) {
            response = `Currently, you're spending more than you earn. Your expenses exceed your income by ${formatMoney(Math.abs(totalIncome - totalExpenses), currency)}. I recommend reviewing your expenses and identifying non-essential items you can cut back on.`;
          } else if (savingRate < 10) {
            response = `Your current saving rate is ${savingRate}%, which is a start but could be improved. Financial experts typically recommend saving at least 20% of your income. Try to identify areas where you can reduce spending to increase your savings.`;
          } else if (savingRate < 20) {
            response = `Your saving rate is ${savingRate}%, which is good but could be better. Consider setting up automatic transfers to a dedicated savings account to reach the recommended 20% saving rate.`;
          } else {
            response = `Excellent! You're saving ${savingRate}% of your income, which exceeds the recommended 20%. You're on a great path toward financial security. Consider investing some of your savings for long-term growth.`;
          }
        }
      }
      else if (query.includes("invest") || query.includes("investment")) {
        response = "Before making investment decisions, it's important to consider your financial goals, time horizon, and risk tolerance. As a general rule, it's advisable to have an emergency fund covering 3-6 months of expenses before starting to invest. Consider diversifying your investments across different asset classes such as stocks, bonds, and perhaps index funds for long-term growth.";
      }
      else if (query.includes("debt") || query.includes("loan")) {
        response = "When managing debt, prioritize high-interest debts first while making minimum payments on others. Consider the debt avalanche method (focusing on highest interest rates) or the debt snowball method (tackling smallest debts first for psychological wins). If you have multiple high-interest debts, you might want to look into debt consolidation options.";
      }
      else if (query.includes("emergency fund") || query.includes("emergency savings")) {
        const emergencyGoal = savingsGoals.find((goal: any) => goal.name.toLowerCase().includes("emergency") || goal.category === "emergency");
        
        if (emergencyGoal) {
          const progress = Math.round((emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100);
          response = `You have an emergency fund goal set up with ${formatMoney(emergencyGoal.currentAmount, currency)} saved so far (${progress}% of your ${formatMoney(emergencyGoal.targetAmount, currency)} target). Financial experts recommend having 3-6 months of essential expenses in your emergency fund.`;
        } else {
          response = "I don't see an emergency fund goal in your savings. It's recommended to have 3-6 months worth of essential expenses saved in an easily accessible account for unexpected situations. Would you like to set up an emergency fund goal?";
        }
      }
      else if (query.includes("how are you") || query.includes("hello") || query.includes("hi")) {
        response = "I'm doing well, thank you! I'm here to help you with any financial questions or guidance you need. What aspect of your finances would you like to discuss today?";
      }
      else {
        response = "I'm here to provide financial insights based on your data. You can ask me about your spending patterns, savings strategies, budgeting tips, or how to reach your financial goals. What would you like to know?";
      }
      
      // Add AI response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const clearConversation = () => {
    const welcomeMessage = {
      id: "welcome",
      content: "Hello! I'm your AI Finance Assistant. How can I help you with your financial planning today?",
      sender: "assistant",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    toast({
      title: "Conversation cleared",
      description: "Your chat history has been reset."
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Finance Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized financial advice based on your data
        </p>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>Finance Assistant</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={clearConversation}>
              Clear conversation
            </Button>
          </div>
          <CardDescription>
            Ask questions about your spending, savings, and financial goals
          </CardDescription>
          <Separator />
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full pr-4 pl-4" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={`h-8 w-8 ${message.sender === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                      {message.sender === 'user' ? (
                        <>
                          <AvatarFallback>U</AvatarFallback>
                          <User className="h-5 w-5 text-primary-foreground" />
                        </>
                      ) : (
                        <>
                          <AvatarFallback>AI</AvatarFallback>
                          <Bot className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </Avatar>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="pt-3 border-t bg-card">
          <div className="flex w-full items-center gap-2">
            <Input 
              placeholder="Ask about your finances..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button type="submit" size="icon" onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
