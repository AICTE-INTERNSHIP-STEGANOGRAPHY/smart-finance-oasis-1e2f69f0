
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, CalendarCheck, Target, Plus, Trash2, Edit, ArrowDown, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/hooks/useCurrency";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type PersonalGoal = {
  id: string;
  name: string;
  completed: boolean;
  category: string;
  deadline?: string;
  notes?: string;
  importedFrom?: { 
    source: 'income' | 'expenditure' | 'savings';
    id: string; 
  };
};

export default function Goals() {
  const { currency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<PersonalGoal[]>(() => {
    const savedGoals = localStorage.getItem("userPersonalGoals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  const [newGoal, setNewGoal] = useState<Omit<PersonalGoal, "id" | "completed">>({
    name: "",
    category: "financial",
    deadline: undefined,
    notes: "",
    importedFrom: undefined
  });
  
  const [categories, setCategories] = useState<Array<{value: string, label: string}>>(() => {
    const savedCategories = localStorage.getItem("goalCategories");
    return savedCategories ? JSON.parse(savedCategories) : [
      { value: "financial", label: "Financial" },
      { value: "career", label: "Career" },
      { value: "education", label: "Education" },
      { value: "health", label: "Health & Fitness" },
      { value: "personal", label: "Personal Development" },
      { value: "family", label: "Family" },
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
  const [importableItems, setImportableItems] = useState<Array<{id: string, name: string, category: string, source: 'income' | 'expenditure' | 'savings'}>>([]);

  // Load importable items
  useEffect(() => {
    const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
    const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
    const savings = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
    
    const importable = [
      ...incomes.map((inc: any) => ({
        id: inc.id,
        name: inc.name,
        category: inc.category,
        source: 'income' as const
      })),
      ...expenses.map((exp: any) => ({
        id: exp.id,
        name: exp.name,
        category: exp.category,
        source: 'expenditure' as const
      })),
      ...savings.map((sav: any) => ({
        id: sav.id,
        name: sav.name,
        category: sav.category,
        source: 'savings' as const
      }))
    ];
    
    setImportableItems(importable);
  }, [isGoalDialogOpen]);

  // Sync with other categories
  useEffect(() => {
    const syncImportedGoals = () => {
      // Get latest data
      const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
      const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
      const savings = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
      
      let updated = false;
      
      // Update goals based on imported sources
      const updatedGoals = goals.map(goal => {
        if (!goal.importedFrom) return goal;
        
        let sourceItem;
        
        // Find the source item
        if (goal.importedFrom.source === 'income') {
          sourceItem = incomes.find((inc: any) => inc.id === goal.importedFrom?.id);
          if (sourceItem?.exceedsGoal && !goal.completed) {
            updated = true;
            return {...goal, completed: true};
          }
        } 
        else if (goal.importedFrom.source === 'expenditure') {
          sourceItem = expenses.find((exp: any) => exp.id === goal.importedFrom?.id);
          if (sourceItem?.exceedsLimit && !goal.completed) {
            updated = true;
            return {...goal, completed: true};
          }
        }
        else if (goal.importedFrom.source === 'savings') {
          sourceItem = savings.find((sav: any) => sav.id === goal.importedFrom?.id);
          if (sourceItem?.isAchieved && !goal.completed) {
            updated = true;
            return {...goal, completed: true};
          }
        }
        
        return goal;
      });
      
      if (updated) {
        setGoals(updatedGoals);
        localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
        
        // Create notification
        const notification = {
          id: crypto.randomUUID(),
          type: "success",
          title: "Personal Goal Achieved!",
          description: `One of your personal goals has been automatically completed based on your financial progress!`,
          date: new Date().toISOString()
        };
        
        const savedNotifications = localStorage.getItem("userNotifications") || "[]";
        const notifications = JSON.parse(savedNotifications);
        notifications.push(notification);
        localStorage.setItem("userNotifications", JSON.stringify(notifications));
      }
    };
    
    // Run sync on mount
    syncImportedGoals();
    
    // Set up a periodic check
    const interval = setInterval(syncImportedGoals, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [goals]);
  
  const handleToggleGoal = (id: string, completed: boolean) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? {...goal, completed} : goal
    );
    
    setGoals(updatedGoals);
    localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
    
    if (completed) {
      // Create notification
      const goalName = goals.find(g => g.id === id)?.name || "Goal";
      const notification = {
        id: crypto.randomUUID(),
        type: "success",
        title: "Personal Goal Completed!",
        description: `Congratulations! You've completed your goal: "${goalName}"!`,
        date: new Date().toISOString()
      };
      
      const savedNotifications = localStorage.getItem("userNotifications") || "[]";
      const notifications = JSON.parse(savedNotifications);
      notifications.push(notification);
      localStorage.setItem("userNotifications", JSON.stringify(notifications));
      
      toast({
        title: "Goal Completed!",
        description: `You've marked "${goalName}" as completed.`,
        variant: "default"
      });
    }
  };
  
  const handleAddGoal = () => {
    if (!newGoal.name) {
      toast({
        title: "Invalid goal",
        description: "Please provide a name for your goal.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    let goal: PersonalGoal;
    
    if (editingGoalId) {
      // Update existing goal
      const updatedGoals = goals.map(g => 
        g.id === editingGoalId 
          ? {
              ...newGoal, 
              id: editingGoalId,
              completed: g.completed
            }
          : g
      );
      
      setGoals(updatedGoals);
      localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
      
      goal = updatedGoals.find(g => g.id === editingGoalId)!;
      
      toast({
        title: "Goal updated",
        description: "Your personal goal has been successfully updated."
      });
    } else {
      // Add new goal
      goal = {
        ...newGoal,
        id: crypto.randomUUID(),
        completed: false
      };
      
      const updatedGoals = [...goals, goal];
      setGoals(updatedGoals);
      localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
      
      toast({
        title: "Goal created",
        description: "Your personal goal has been successfully created."
      });
    }
    
    setIsLoading(false);
    setIsGoalDialogOpen(false);
    setEditingGoalId(null);
    resetGoalForm();
  };
  
  const resetGoalForm = () => {
    setNewGoal({
      name: "",
      category: "financial",
      deadline: undefined,
      notes: "",
      importedFrom: undefined
    });
    setShowImported(false);
  };
  
  const handleEditGoal = (goal: PersonalGoal) => {
    setEditingGoalId(goal.id);
    setNewGoal({
      name: goal.name,
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
      const updatedGoals = goals.filter(goal => goal.id !== selectedGoalId);
      setGoals(updatedGoals);
      localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
      
      toast({
        title: "Goal deleted",
        description: "The personal goal has been removed."
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedGoalId(null);
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
    localStorage.setItem("goalCategories", JSON.stringify(updatedCategories));
    
    toast({
      title: "Category added",
      description: "Your new goal category has been added."
    });
    
    setNewCategory({ value: "", label: "" });
    setIsCategoryDialogOpen(false);
  };
  
  const handleImportItem = (importItem: typeof importableItems[0]) => {
    let sourceName = '';
    
    if (importItem.source === 'income') sourceName = 'Income Goal';
    else if (importItem.source === 'expenditure') sourceName = 'Budget Goal';
    else if (importItem.source === 'savings') sourceName = 'Savings Goal';
    
    setNewGoal({
      ...newGoal,
      name: `${sourceName}: ${importItem.name}`,
      importedFrom: {
        source: importItem.source,
        id: importItem.id
      }
    });
    setShowImported(true);
  };
  
  const activeGoals = goals.filter(goal => !goal.completed).length;
  const completedGoals = goals.filter(goal => goal.completed).length;
  
  // Count upcoming deadlines
  const now = new Date();
  const upcomingDeadlines = goals.filter(goal => {
    if (!goal.deadline || goal.completed) return false;
    const deadlineDate = new Date(goal.deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 7; // within a week
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personal Goals</h1>
        <p className="text-muted-foreground">
          Set and track your financial goals
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Goals
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              {activeGoals === 0 ? "No active goals" : `${activeGoals} goals in progress`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle className={`h-4 w-4 ${completedGoals > 0 ? "text-green-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${completedGoals > 0 ? "text-green-500" : ""}`}>{completedGoals}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals === 0 ? "No completed goals" : `${completedGoals} goals achieved`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Deadlines
            </CardTitle>
            <CalendarCheck className={`h-4 w-4 ${upcomingDeadlines > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${upcomingDeadlines > 0 ? "text-amber-500" : ""}`}>{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingDeadlines === 0 ? "No upcoming deadlines" : `${upcomingDeadlines} deadlines this week`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Goal Categories</CardTitle>
            <CardDescription>Track your financial objectives by category</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            Manage Categories
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryGoals = goals.filter(goal => goal.category === category.value);
                if (categoryGoals.length === 0) return null;
                
                return (
                  <div key={category.value}>
                    <h3 className="font-medium mb-2">{category.label} Goals</h3>
                    <div className="pl-6 space-y-2">
                      {categoryGoals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`goal-${goal.id}`} 
                              checked={goal.completed}
                              onCheckedChange={(checked) => handleToggleGoal(goal.id, checked === true)}
                            />
                            <div className="flex items-center space-x-2">
                              <Label 
                                htmlFor={`goal-${goal.id}`}
                                className={`${goal.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {goal.name}
                              </Label>
                              {goal.completed && <Star className="h-3 w-3 text-green-500" />}
                              {goal.importedFrom && <ArrowDown className="h-3 w-3 text-blue-500" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {goal.deadline && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            )}
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>You haven't created any personal goals yet. Start by creating your first one.</p>
          )}
          
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingGoalId ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                <DialogDescription>
                  {showImported 
                    ? "This goal is linked to another entry in your finances"
                    : "Set your personal goal and track your progress"}
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
                        <SelectLabel>Income Goals</SelectLabel>
                        {importableItems
                          .filter(item => item.source === 'income')
                          .map(item => (
                            <SelectItem key={`income-${item.id}`} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Expense Budgets</SelectLabel>
                        {importableItems
                          .filter(item => item.source === 'expenditure')
                          .map(item => (
                            <SelectItem key={`expense-${item.id}`} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Savings Goals</SelectLabel>
                        {importableItems
                          .filter(item => item.source === 'savings')
                          .map(item => (
                            <SelectItem key={`savings-${item.id}`} value={item.id}>
                              {item.name}
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
                  {isLoading ? "Saving..." : (editingGoalId ? "Save Changes" : "Create Goal")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the selected goal.
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
                <DialogTitle>Manage Goal Categories</DialogTitle>
                <DialogDescription>
                  Add or modify goal categories
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
                        placeholder="e.g. health"
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
                        placeholder="e.g. Health Goals"
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
        </CardContent>
      </Card>
    </div>
  );
}
