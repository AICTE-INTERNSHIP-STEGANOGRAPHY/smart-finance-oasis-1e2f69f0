import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PiggyBank, TrendingUp, Calendar, Plus, CheckCircle, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";
import { Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type SavingsGoal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  category: string;
  deadline?: string;
  notes?: string;
  isAchieved?: boolean;
  importedFrom?: { 
    source: 'income' | 'expenditure';
    id: string; 
  };
};

export default function Savings() {
  const { currency, currencySymbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const savedGoals = localStorage.getItem("userSavingsGoals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  const [newGoal, setNewGoal] = useState<Omit<SavingsGoal, "id" | "isAchieved">>({
    name: "",
    currentAmount: 0,
    targetAmount: 0,
    category: "emergency",
    deadline: undefined,
    notes: "",
    importedFrom: undefined
  });
  
  const [categories, setCategories] = useState<Array<{value: string, label: string}>>(() => {
    const savedCategories = localStorage.getItem("savingsCategories");
    return savedCategories ? JSON.parse(savedCategories) : [
      { value: "emergency", label: "Emergency Fund" },
      { value: "retirement", label: "Retirement" },
      { value: "education", label: "Education" },
      { value: "home", label: "Home Purchase" },
      { value: "vacation", label: "Vacation" },
      { value: "vehicle", label: "Vehicle" },
      { value: "other", label: "Other" }
    ];
  });
  
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: "", label: "" });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [showImported, setShowImported] = useState(false);
  const [importableItems, setImportableItems] = useState<Array<{id: string, name: string, amount: number, category: string, source: 'income' | 'expenditure'}>>([]);

  useEffect(() => {
    const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
    const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
    
    const importable = [
      ...incomes.map((inc: any) => ({
        id: inc.id,
        name: inc.name,
        amount: inc.amount,
        category: inc.category,
        source: 'income' as const
      })),
      ...expenses.map((exp: any) => ({
        id: exp.id,
        name: exp.name,
        amount: exp.amount,
        category: exp.category,
        source: 'expenditure' as const
      }))
    ];
    
    setImportableItems(importable);
  }, [isGoalDialogOpen]);

  useEffect(() => {
    const checkGoalAchievements = () => {
      let updated = false;
      const updatedGoals = savingsGoals.map(goal => {
        if (!goal.isAchieved && goal.currentAmount >= goal.targetAmount) {
          updated = true;
          
          const notification = {
            id: crypto.randomUUID(),
            type: "success",
            title: "Savings Goal Achieved!",
            description: `Congratulations! You've reached your savings goal "${goal.name}" of ${formatMoney(goal.targetAmount, currency)}!`,
            date: new Date().toISOString()
          };
          
          const savedNotifications = localStorage.getItem("userNotifications") || "[]";
          const notifications = JSON.parse(savedNotifications);
          notifications.push(notification);
          localStorage.setItem("userNotifications", JSON.stringify(notifications));
          
          toast({
            title: "Savings Goal Achieved!",
            description: `You've reached your target for "${goal.name}"!`,
            variant: "default"
          });
          
          return {...goal, isAchieved: true};
        }
        return goal;
      });
      
      if (updated) {
        setSavingsGoals(updatedGoals);
        localStorage.setItem("userSavingsGoals", JSON.stringify(updatedGoals));
      }
    };
    
    checkGoalAchievements();
  }, [savingsGoals, currency]);
  
  const handleAddGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) {
      toast({
        title: "Invalid savings goal",
        description: "Please provide a name and a valid target amount.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    let goal: SavingsGoal;
    
    if (editingGoalId) {
      const updatedGoals = savingsGoals.map(g => 
        g.id === editingGoalId 
          ? {
              ...newGoal, 
              id: editingGoalId,
              isAchieved: newGoal.currentAmount >= newGoal.targetAmount
            }
          : g
      );
      
      setSavingsGoals(updatedGoals);
      localStorage.setItem("userSavingsGoals", JSON.stringify(updatedGoals));
      
      goal = updatedGoals.find(g => g.id === editingGoalId)!;
      
      toast({
        title: "Goal updated",
        description: "Your savings goal has been successfully updated."
      });
    } else {
      goal = {
        ...newGoal,
        id: crypto.randomUUID(),
        isAchieved: newGoal.currentAmount >= newGoal.targetAmount
      };
      
      const updatedGoals = [...savingsGoals, goal];
      setSavingsGoals(updatedGoals);
      localStorage.setItem("userSavingsGoals", JSON.stringify(updatedGoals));
      
      toast({
        title: "Goal added",
        description: "Your savings goal has been successfully created."
      });
    }
    
    if (goal.currentAmount >= goal.targetAmount) {
      const notification = {
        id: crypto.randomUUID(),
        type: "success",
        title: "Savings Goal Achieved!",
        description: `Congratulations! You've already reached your savings goal "${goal.name}" of ${formatMoney(goal.targetAmount, currency)}!`,
        date: new Date().toISOString()
      };
      
      const savedNotifications = localStorage.getItem("userNotifications") || "[]";
      const notifications = JSON.parse(savedNotifications);
      notifications.push(notification);
      localStorage.setItem("userNotifications", JSON.stringify(notifications));
    }
    
    setIsLoading(false);
    setIsGoalDialogOpen(false);
    setEditingGoalId(null);
    resetGoalForm();
  };
  
  const resetGoalForm = () => {
    setNewGoal({
      name: "",
      currentAmount: 0,
      targetAmount: 0,
      category: "emergency",
      deadline: undefined,
      notes: "",
      importedFrom: undefined
    });
    setShowImported(false);
  };
  
  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setNewGoal({
      name: goal.name,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      category: goal.category,
      deadline: goal.deadline,
      notes: goal.notes || "",
      importedFrom: goal.importedFrom
    });
    setShowImported(!!goal.importedFrom);
    setIsGoalDialogOpen(true);
  };
  
  const handleDeleteGoal = (id: string) => {
    setSelectedGoalId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteGoal = () => {
    if (selectedGoalId) {
      const updatedGoals = savingsGoals.filter(goal => goal.id !== selectedGoalId);
      setSavingsGoals(updatedGoals);
      localStorage.setItem("userSavingsGoals", JSON.stringify(updatedGoals));
      
      toast({
        title: "Goal deleted",
        description: "The savings goal has been removed."
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedGoalId(null);
    }
  };
  
  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) {
      toast({
        title: "Invalid category",
        description: "Please provide both an item and label for the category.",
        variant: "destructive"
      });
      return;
    }
    
    if (categories.some(cat => cat.value === newCategory.value)) {
      toast({
        title: "Category already exists",
        description: "A category with this item already exists.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem("savingsCategories", JSON.stringify(updatedCategories));
    
    toast({
      title: "Category added",
      description: "Your new savings category has been added."
    });
    
    setNewCategory({ value: "", label: "" });
    setIsCategoryDialogOpen(false);
  };
  
  const handleImportItem = (importItem: typeof importableItems[0]) => {
    setNewGoal({
      ...newGoal,
      name: `${importItem.source === 'income' ? 'Income from' : 'Savings from'} ${importItem.name}`,
      currentAmount: importItem.source === 'income' ? importItem.amount : 0,
      targetAmount: importItem.source === 'income' ? importItem.amount * 1.1 : importItem.amount,
      importedFrom: {
        source: importItem.source,
        id: importItem.id
      }
    });
    setShowImported(true);
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const savingsRate = totalSaved > 0 && totalTarget > 0 
    ? Math.round((totalSaved / totalTarget) * 100) 
    : 0;
    
  const monthlyContribution = savingsGoals.length > 0
    ? totalSaved / savingsGoals.reduce((months, goal) => {
        if (!goal.deadline) return months;
        const date = new Date(goal.deadline);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        return months.has(key) ? months : months.add(key);
      }, new Set<string>()).size || 0
    : 0;
    
  const goalsAchieved = savingsGoals.filter(goal => goal.isAchieved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
        <p className="text-muted-foreground">
          Monitor your savings progress and goals
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Savings
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalSaved, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {savingsGoals.length > 0 
                ? `From ${savingsGoals.length} saving goals` 
                : "No savings recorded yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Contribution
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(monthlyContribution, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyContribution > 0
                ? "Average monthly contribution"
                : "No contributions recorded"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Savings Rate
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${goalsAchieved > 0 ? "text-green-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${goalsAchieved > 0 ? "text-green-500" : ""}`}>
              {savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {`${goalsAchieved} of ${savingsGoals.length} goals achieved`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track progress towards your financial goals</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            Manage Categories
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsGoals.length > 0 ? (
            <div className="space-y-4">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="font-medium">{goal.name}</div>
                      {goal.isAchieved && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                      {goal.importedFrom && <ArrowDown className="h-4 w-4 ml-2 text-blue-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatMoney(goal.currentAmount, currency)} / {formatMoney(goal.targetAmount, currency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>
                      {categories.find(cat => cat.value === goal.category)?.label}
                      {goal.deadline && ` • Due ${new Date(goal.deadline).toLocaleDateString()}`}
                    </span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't set up any savings goals yet. Create your first goal to start tracking progress.</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Savings Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingGoalId ? "Edit Savings Goal" : "Add New Savings Goal"}</DialogTitle>
                <DialogDescription>
                  {showImported 
                    ? "This goal is linked to another entry in your finances"
                    : "Set your savings target and track your progress"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="imported" className="text-right">
                    Import from:
                  </Label>
                  <Select onValueChange={(value) => {
                    const selected = importableItems.find(item => item.id === value);
                    if (selected) handleImportItem(selected);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an item to import" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Income</SelectLabel>
                        {importableItems
                          .filter(item => item.source === 'income')
                          .map(item => (
                            <SelectItem key={`income-${item.id}`} value={item.id}>
                              {item.name} ({formatMoney(item.amount, currency)})
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Expenses</SelectLabel>
                        {importableItems
                          .filter(item => item.source === 'expenditure')
                          .map(item => (
                            <SelectItem key={`expense-${item.id}`} value={item.id}>
                              {item.name} ({formatMoney(item.amount, currency)})
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Goal Name
                  </Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentAmount" className="text-right">
                    Current Amount
                  </Label>
                  <div className="col-span-3 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">{currencySymbol}</span>
                    </div>
                    <Input
                      id="currentAmount"
                      type="number"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                      className="pl-8"
                      readOnly={showImported}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAmount" className="text-right">
                    Target Amount
                  </Label>
                  <div className="col-span-3 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">{currencySymbol}</span>
                    </div>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select 
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({...newGoal, category: value})}
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
                  <Label htmlFor="deadline" className="text-right">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline || ""}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value || undefined})}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={newGoal.notes || ""}
                    onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddGoal} disabled={isLoading}>
                  {isLoading ? "Saving..." : (editingGoalId ? "Save Changes" : "Add Goal")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the selected savings goal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteGoal} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage Savings Categories</DialogTitle>
                <DialogDescription>
                  Add or modify savings categories
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Current Categories</h3>
                  <ScrollArea className="h-[120px] rounded-md border">
                    <div className="grid gap-2 p-2">
                      {categories.map((category) => (
                        <div key={category.value} className="flex justify-between items-center p-2 bg-muted rounded-md">
                          <span>{category.label}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Add New Category</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="categoryValue" className="text-right text-xs">
                        Item
                      </Label>
                      <Input
                        id="categoryValue"
                        value={newCategory.value}
                        onChange={(e) => setNewCategory({...newCategory, value: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                        className="col-span-3"
                        placeholder="e.g. vacation"
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
                        placeholder="e.g. Vacation Fund"
                      />
                    </div>
                    <Button 
                      onClick={handleAddCategory}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Category
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
