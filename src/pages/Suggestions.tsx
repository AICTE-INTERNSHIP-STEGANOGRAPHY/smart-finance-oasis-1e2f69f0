
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, ArrowUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function Suggestions() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("aiChatHistory");
    return savedMessages 
      ? JSON.parse(savedMessages) 
      : [
          {
            id: "welcome",
            content: "👋 Hello! I'm your AI Finance Assistant. I can help analyze your financial data and provide suggestions to improve your financial health. What would you like to know about your finances today?",
            sender: "assistant",
            timestamp: new Date()
          }
        ];
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currency } = useCurrency();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("aiChatHistory", JSON.stringify(messages));
  }, [messages]);

  // Get financial data for AI analysis
  const getFinancialData = () => {
    try {
      const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
      const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
      const savings = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
      
      const totalIncome = incomes.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      const totalSaved = savings.reduce((sum: number, save: any) => sum + (save.currentAmount || 0), 0);
      
      const topExpenseCategory = expenses.length > 0 
        ? Object.entries(
            expenses.reduce((acc: Record<string, number>, exp: any) => {
              acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1])[0]?.[0] || "none"
        : "none";
        
      // Fix: Convert to number before division to ensure proper calculation
      const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;
      
      return {
        totalIncome,
        totalExpenses,
        totalSaved,
        savingsRate,
        topExpenseCategory,
        numIncomes: incomes.length,
        numExpenses: expenses.length,
        numSavings: savings.length
      };
    } catch (error) {
      console.error("Error processing financial data:", error);
      return null;
    }
  };

  // Generate AI response based on user input and financial data
  const generateResponse = (userInput: string) => {
    const financialData = getFinancialData();
    
    if (!financialData) {
      return "I'm having trouble analyzing your financial data right now. Please try again later.";
    }
    
    const { totalIncome, totalExpenses, totalSaved, savingsRate, topExpenseCategory, numIncomes, numExpenses } = financialData;
    
    // Basic income/expense analysis
    if (userInput.toLowerCase().includes("income") || userInput.toLowerCase().includes("earn")) {
      if (numIncomes === 0) {
        return "You haven't recorded any income sources yet. Would you like to add some in the Earnings section?";
      }
      return `Based on your recorded data, your total income is ${formatMoney(totalIncome, currency)}. Would you like more detailed analysis on your income sources?`;
    }
    
    if (userInput.toLowerCase().includes("expense") || userInput.toLowerCase().includes("spend")) {
      if (numExpenses === 0) {
        return "You haven't recorded any expenses yet. Would you like to add some in the Expenditures section?";
      }
      return `You've spent a total of ${formatMoney(totalExpenses, currency)}, with your highest spending in the ${topExpenseCategory} category. Would you like suggestions on how to reduce your expenses?`;
    }
    
    if (userInput.toLowerCase().includes("save") || userInput.toLowerCase().includes("saving")) {
      return `Your current savings amount to ${formatMoney(totalSaved, currency)}, which represents a ${savingsRate}% savings rate. Financial experts typically recommend saving at least 20% of your income.`;
    }
    
    if (userInput.toLowerCase().includes("budget") || userInput.toLowerCase().includes("plan")) {
      const remainingIncome = totalIncome - totalExpenses;
      if (remainingIncome < 0) {
        return `You're currently spending ${formatMoney(Math.abs(remainingIncome), currency)} more than you earn. I recommend reviewing your expenses to identify areas where you can cut back.`;
      } else {
        return `You have ${formatMoney(remainingIncome, currency)} remaining after expenses. Consider allocating this to your savings goals or investments.`;
      }
    }
    
    if (userInput.toLowerCase().includes("advice") || userInput.toLowerCase().includes("tip") || userInput.toLowerCase().includes("help")) {
      if (totalExpenses > totalIncome) {
        return "Your expenses exceed your income. Consider creating a budget to track and reduce spending, particularly in your highest spending category: " + topExpenseCategory;
      } else if (savingsRate < 20) {
        return "Your savings rate is currently " + savingsRate + "%. Consider increasing your savings to at least 20% of your income for better long-term financial health.";
      } else {
        return "You're doing well with your savings rate of " + savingsRate + "%! Consider exploring investment options for some of your savings to help them grow faster.";
      }
    }
    
    // Default responses
    const defaultResponses = [
      "I can help analyze your income, expenses, and savings. What specific aspect of your finances would you like to know about?",
      "Would you like suggestions on how to improve your savings or reduce expenses?",
      "I can provide insights on your spending patterns or savings rate. What would be most helpful?",
      "I'm here to assist with your financial questions. Would you like to know more about your income breakdown or expense categories?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
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
    
    // Generate and add AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        content: generateResponse(input),
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    const initialMessage = {
      id: "welcome",
      content: "👋 Hello! I'm your AI Finance Assistant. I can help analyze your financial data and provide suggestions to improve your financial health. What would you like to know about your finances today?",
      sender: "assistant" as "assistant",
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Finance Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized financial insights and suggestions
        </p>
      </div>
      
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-2 border-b flex flex-row justify-between items-center">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Finance Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[80%] md:max-w-[70%] ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'user' ? 
                        <User className="h-4 w-4" /> : 
                        <Bot className="h-4 w-4" />
                      }
                      <span className="text-xs">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your finances..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
