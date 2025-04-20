
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { BarChart, CreditCard, PieChart, Wallet, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  limit?: number;
  exceedsLimit?: boolean;
};

export default function Expenditures() {
  const { currency, currencySymbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem("userExpenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id" | "exceedsLimit">>({
    name: "",
    amount: 0,
    category: "food",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    limit: 0
  });
  
  const categories = [
    { value: "food", label: "Food & Dining" },
    { value: "clothing", label: "Clothes & Footwear" },
    { value: "rent", label: "Rent & Housing" },
    { value: "utilities", label: "Utilities & Bills" },
    { value: "entertainment", label: "Entertainment" },
    { value: "travel", label: "Travel" },
    { value: "health", label: "Health & Medical" },
    { value: "education", label: "Education" },
    { value: "misc", label: "Miscellaneous" }
  ];
  
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  const handleAddExpense = () => {
    if (!newExpense.name || newExpense.amount <= 0) {
      toast({
        title: "Invalid expense",
        description: "Please provide a name and a valid amount.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    const expense: Expense = {
      ...newExpense,
      id: crypto.randomUUID(),
      exceedsLimit: newExpense.limit ? newExpense.amount > newExpense.limit : false
    };
    
    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    localStorage.setItem("userExpenses", JSON.stringify(updatedExpenses));
    
    // Store in notifications if limit exceeded
    if (expense.exceedsLimit) {
      const notification = {
        id: crypto.randomUUID(),
        type: "warning",
        title: "Budget Limit Exceeded",
        description: `Your expense "${expense.name}" (${formatMoney(expense.amount, currency)}) has exceeded the set limit of ${formatMoney(expense.limit || 0, currency)}`,
        date: new Date().toISOString()
      };
      
      const savedNotifications = localStorage.getItem("userNotifications") || "[]";
      const notifications = JSON.parse(savedNotifications);
      notifications.push(notification);
      localStorage.setItem("userNotifications", JSON.stringify(notifications));
      
      toast({
        title: "Budget Limit Exceeded",
        description: `Your expense has exceeded the set limit.`,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
    setIsExpenseDialogOpen(false);
    setNewExpense({
      name: "",
      amount: 0,
      category: "food",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      limit: 0
    });
    
    toast({
      title: "Expense added",
      description: "Your expense has been successfully recorded."
    });
  };
  
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const highestCategory = expenses.length > 0 
    ? categories.find(cat => cat.value === 
        Object.entries(
          expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      )?.label || "None"
    : "None";
  
  const exceededLimits = expenses.filter(expense => expense.exceedsLimit).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenditures</h1>
        <p className="text-muted-foreground">
          Track and manage your spending
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalSpent, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length > 0 
                ? `From ${expenses.length} recorded expenses` 
                : "No expenditures recorded yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Category
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestCategory}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length > 0 
                ? "Most frequent spending category" 
                : "No categories available"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Alerts
            </CardTitle>
            <AlertCircle className={`h-4 w-4 ${exceededLimits > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${exceededLimits > 0 ? "text-red-500" : ""}`}>{exceededLimits}</div>
            <p className="text-xs text-muted-foreground">
              {exceededLimits > 0
                ? `${exceededLimits} budget limits exceeded`
                : "No budget limits exceeded"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Expenses Management</CardTitle>
            <CardDescription>Track, add, and manage your expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Expenses</h3>
                <div className="grid gap-2">
                  {expenses.slice(0, 5).map((expense) => (
                    <div 
                      key={expense.id} 
                      className={`flex justify-between items-center p-3 rounded-md ${
                        expense.exceedsLimit ? "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-muted"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categories.find(cat => cat.value === expense.category)?.label} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${expense.exceedsLimit ? "text-red-600 dark:text-red-400" : ""}`}>
                          {formatMoney(expense.amount, currency)}
                        </p>
                        {expense.limit && (
                          <p className="text-xs text-muted-foreground">
                            Limit: {formatMoney(expense.limit, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>You haven't added any expenses yet. Start by adding your first one.</p>
            )}
          </CardContent>
          <CardFooter>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Expense</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of your expense below
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newExpense.name}
                      onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <div className="col-span-3 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="limit" className="text-right">
                      Limit
                    </Label>
                    <div className="col-span-3 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
                      </div>
                      <Input
                        id="limit"
                        type="number"
                        value={newExpense.limit || ""}
                        onChange={(e) => setNewExpense({
                          ...newExpense, 
                          limit: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        className="pl-8"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select 
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={newExpense.notes || ""}
                      onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                      className="col-span-3"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddExpense} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Expense"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
