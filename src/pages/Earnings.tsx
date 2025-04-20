
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { BarChart, CalendarCheck, DollarSign, TrendingUp, Plus, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";

type Income = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  goal?: number;
  exceedsGoal?: boolean;
};

export default function Earnings() {
  const { currency, currencySymbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const savedIncomes = localStorage.getItem("userIncomes");
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });
  
  const [newIncome, setNewIncome] = useState<Omit<Income, "id" | "exceedsGoal">>({
    name: "",
    amount: 0,
    category: "salary",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    goal: 0
  });
  
  const [categories, setCategories] = useState<Array<{value: string, label: string}>>(() => {
    const savedCategories = localStorage.getItem("incomeCategories");
    return savedCategories ? JSON.parse(savedCategories) : [
      { value: "salary", label: "Salary & Wages" },
      { value: "business", label: "Business Income" },
      { value: "investment", label: "Investment Returns" },
      { value: "freelance", label: "Freelance & Contract Work" },
      { value: "rental", label: "Rental Income" },
      { value: "other", label: "Other Income" }
    ];
  });
  
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: "", label: "" });
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  const handleAddIncome = () => {
    if (!newIncome.name || newIncome.amount <= 0) {
      toast({
        title: "Invalid income",
        description: "Please provide a name and a valid amount.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    let income: Income;
    
    if (editingIncomeId) {
      // Update existing income
      const updatedIncomes = incomes.map(inc => 
        inc.id === editingIncomeId 
          ? {
              ...newIncome, 
              id: editingIncomeId,
              exceedsGoal: newIncome.goal ? newIncome.amount >= newIncome.goal : false
            }
          : inc
      );
      
      setIncomes(updatedIncomes);
      localStorage.setItem("userIncomes", JSON.stringify(updatedIncomes));
      
      income = updatedIncomes.find(inc => inc.id === editingIncomeId)!;
      
      toast({
        title: "Income updated",
        description: "Your income has been successfully updated."
      });
    } else {
      // Add new income
      income = {
        ...newIncome,
        id: crypto.randomUUID(),
        exceedsGoal: newIncome.goal ? newIncome.amount >= newIncome.goal : false
      };
      
      const updatedIncomes = [...incomes, income];
      setIncomes(updatedIncomes);
      localStorage.setItem("userIncomes", JSON.stringify(updatedIncomes));
      
      toast({
        title: "Income added",
        description: "Your income has been successfully recorded."
      });
    }
    
    // Store in notifications if goal exceeded
    if (income.goal && income.amount >= income.goal) {
      const notification = {
        id: crypto.randomUUID(),
        type: "success",
        title: "Income Goal Reached",
        description: `Your income "${income.name}" (${formatMoney(income.amount, currency)}) has reached or exceeded the goal of ${formatMoney(income.goal, currency)}!`,
        date: new Date().toISOString()
      };
      
      const savedNotifications = localStorage.getItem("userNotifications") || "[]";
      const notifications = JSON.parse(savedNotifications);
      notifications.push(notification);
      localStorage.setItem("userNotifications", JSON.stringify(notifications));
      
      toast({
        title: "Goal Achieved!",
        description: `You've reached your income goal for "${income.name}"!`,
        variant: "default"
      });
    }
    
    setIsLoading(false);
    setIsIncomeDialogOpen(false);
    setEditingIncomeId(null);
    resetIncomeForm();
  };
  
  const resetIncomeForm = () => {
    setNewIncome({
      name: "",
      amount: 0,
      category: "salary",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      goal: 0
    });
  };
  
  const handleEditIncome = (income: Income) => {
    setEditingIncomeId(income.id);
    setNewIncome({
      name: income.name,
      amount: income.amount,
      category: income.category,
      date: income.date,
      notes: income.notes || "",
      goal: income.goal || 0
    });
    setIsIncomeDialogOpen(true);
  };
  
  const handleDeleteIncome = (id: string) => {
    setSelectedIncomeId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteIncome = () => {
    if (selectedIncomeId) {
      const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
      setIncomes(updatedIncomes);
      localStorage.setItem("userIncomes", JSON.stringify(updatedIncomes));
      
      toast({
        title: "Income deleted",
        description: "The income source has been removed."
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedIncomeId(null);
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
    localStorage.setItem("incomeCategories", JSON.stringify(updatedCategories));
    
    toast({
      title: "Category added",
      description: "Your new income category has been added."
    });
    
    setNewCategory({ value: "", label: "" });
    setIsCategoryDialogOpen(false);
  };
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const highestCategory = incomes.length > 0 
    ? categories.find(cat => cat.value === 
        Object.entries(
          incomes.reduce((acc, income) => {
            acc[income.category] = (acc[income.category] || 0) + income.amount;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      )?.label || "None"
    : "None";
  
  const monthlyAverage = incomes.length > 0 
    ? totalIncome / incomes.reduce((months, income) => {
        const date = new Date(income.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        return months.has(key) ? months : months.add(key);
      }, new Set<string>()).size
    : 0;
  
  const goalAchieved = incomes.filter(income => income.exceedsGoal).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">
          Monitor and manage your income sources
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalIncome, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {incomes.length > 0 
                ? `From ${incomes.length} income sources` 
                : "No earnings recorded yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Average
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(monthlyAverage || 0, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {incomes.length > 0 
                ? "Based on your history" 
                : "No history yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Goals Achieved
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${goalAchieved > 0 ? "text-green-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${goalAchieved > 0 ? "text-green-500" : ""}`}>{goalAchieved}</div>
            <p className="text-xs text-muted-foreground">
              {goalAchieved > 0 
                ? `${goalAchieved} income goals reached` 
                : "No goals reached yet"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Income Management</CardTitle>
              <CardDescription>Track, add, and manage your income sources</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              Manage Categories
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomes.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Income Sources</h3>
                <div className="grid gap-2">
                  {incomes.map((income) => (
                    <div 
                      key={income.id} 
                      className={`flex justify-between items-center p-3 rounded-md ${
                        income.exceedsGoal ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-muted"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium">{income.name}</p>
                          {income.exceedsGoal && (
                            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {categories.find(cat => cat.value === income.category)?.label} • {new Date(income.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className={`font-bold ${income.exceedsGoal ? "text-green-600 dark:text-green-400" : ""}`}>
                          {formatMoney(income.amount, currency)}
                        </p>
                        {income.goal && income.goal > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Goal: {formatMoney(income.goal, currency)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditIncome(income)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>You haven't added any income sources yet. Start by adding your first one.</p>
            )}
          </CardContent>
          <CardFooter>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Income Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingIncomeId ? "Edit Income" : "Add New Income"}</DialogTitle>
                  <DialogDescription>
                    Enter the details of your income source below
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newIncome.name}
                      onChange={(e) => setNewIncome({...newIncome, name: e.target.value})}
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
                        value={newIncome.amount}
                        onChange={(e) => setNewIncome({...newIncome, amount: parseFloat(e.target.value) || 0})}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goal" className="text-right">
                      Goal
                    </Label>
                    <div className="col-span-3 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
                      </div>
                      <Input
                        id="goal"
                        type="number"
                        value={newIncome.goal || ""}
                        onChange={(e) => setNewIncome({
                          ...newIncome, 
                          goal: e.target.value ? parseFloat(e.target.value) : undefined
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
                      value={newIncome.category}
                      onValueChange={(value) => setNewIncome({...newIncome, category: value})}
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
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={newIncome.notes || ""}
                      onChange={(e) => setNewIncome({...newIncome, notes: e.target.value})}
                      className="col-span-3"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddIncome} disabled={isLoading}>
                    {isLoading ? "Saving..." : (editingIncomeId ? "Save Changes" : "Add Income")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected income source.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteIncome} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Manage Income Categories</DialogTitle>
                  <DialogDescription>
                    Add or modify income categories
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
                          placeholder="e.g. bonus"
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
                          placeholder="e.g. Bonus Income"
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
