
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { BarChart, CreditCard, PieChart, Wallet, AlertCircle, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  
  const [categories, setCategories] = useState<Array<{value: string, label: string}>>(() => {
    const savedCategories = localStorage.getItem("expenseCategories");
    return savedCategories ? JSON.parse(savedCategories) : [
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
  });
  
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: "", label: "" });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
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
    
    let expense: Expense;
    
    if (editingExpenseId) {
      // Update existing expense
      const updatedExpenses = expenses.map(exp => 
        exp.id === editingExpenseId 
          ? {
              ...newExpense, 
              id: editingExpenseId,
              exceedsLimit: newExpense.limit ? newExpense.amount > newExpense.limit : false
            }
          : exp
      );
      
      setExpenses(updatedExpenses);
      localStorage.setItem("userExpenses", JSON.stringify(updatedExpenses));
      
      expense = updatedExpenses.find(exp => exp.id === editingExpenseId)!;
      
      toast({
        title: "Expense updated",
        description: "Your expense has been successfully updated."
      });
    } else {
      // Add new expense
      expense = {
        ...newExpense,
        id: crypto.randomUUID(),
        exceedsLimit: newExpense.limit ? newExpense.amount > newExpense.limit : false
      };
      
      const updatedExpenses = [...expenses, expense];
      setExpenses(updatedExpenses);
      localStorage.setItem("userExpenses", JSON.stringify(updatedExpenses));
      
      toast({
        title: "Expense added",
        description: "Your expense has been successfully recorded."
      });
    }
    
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
    setEditingExpenseId(null);
    resetExpenseForm();
  };
  
  const resetExpenseForm = () => {
    setNewExpense({
      name: "",
      amount: 0,
      category: "food",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      limit: 0
    });
  };
  
  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || "",
      limit: expense.limit || 0
    });
    setIsExpenseDialogOpen(true);
  };
  
  const handleDeleteExpense = (id: string) => {
    setSelectedExpenseId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteExpense = () => {
    if (selectedExpenseId) {
      const updatedExpenses = expenses.filter(expense => expense.id !== selectedExpenseId);
      setExpenses(updatedExpenses);
      localStorage.setItem("userExpenses", JSON.stringify(updatedExpenses));
      
      toast({
        title: "Expense deleted",
        description: "The expense has been removed."
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };
  
  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) {
      toast({
        title: "Invalid category",
        description: "Please provide both a value and label for the category.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.value === newCategory.value)) {
      toast({
        title: "Category already exists",
        description: "A category with this value already exists.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem("expenseCategories", JSON.stringify(updatedCategories));
    
    toast({
      title: "Category added",
      description: "Your new expense category has been added."
    });
    
    setNewCategory({ value: "", label: "" });
    setIsCategoryDialogOpen(false);
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
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Expenses Management</CardTitle>
              <CardDescription>Track, add, and manage your expenses</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              Manage Categories
            </Button>
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
                      <div className="flex-1">
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categories.find(cat => cat.value === expense.category)?.label} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className={`font-bold ${expense.exceedsLimit ? "text-red-600 dark:text-red-400" : ""}`}>
                          {formatMoney(expense.amount, currency)}
                        </p>
                        {expense.limit && (
                          <p className="text-xs text-muted-foreground">
                            Limit: {formatMoney(expense.limit, currency)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingExpenseId ? "Edit Expense" : "Add New Expense"}</DialogTitle>
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
                        onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
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
                    {isLoading ? "Saving..." : (editingExpenseId ? "Save Changes" : "Add Expense")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected expense.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteExpense} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Manage Expense Categories</DialogTitle>
                  <DialogDescription>
                    Add or modify expense categories
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Current Categories</h3>
                    <div className="grid gap-2">
                      {categories.map((category) => (
                        <div key={category.value} className="flex justify-between items-center p-2 bg-muted rounded-md">
                          <span>{category.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Add New Category</h3>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="categoryValue" className="text-right text-xs">
                          Value
                        </Label>
                        <Input
                          id="categoryValue"
                          value={newCategory.value}
                          onChange={(e) => setNewCategory({...newCategory, value: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                          className="col-span-3"
                          placeholder="e.g. groceries"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="categoryLabel" className="text-right text-xs">
                          Label
                        </Label>
                        <Input
                          id="categoryLabel"
                          value={newCategory.label}
                          onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                          className="col-span-3"
                          placeholder="e.g. Grocery Shopping"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCategory}>
                    Add Category
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
