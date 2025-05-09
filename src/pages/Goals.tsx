
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
import { DatePicker } from "@/components/forms/DatePicker";

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
  
  const [categories, setCategories] = useState<Array<{item: string, label: string}>>(() => {
    const savedCategories = localStorage.getItem("goalCategories");
    if (savedCategories) {
      let arr: Array<any> = JSON.parse(savedCategories);
      arr = arr.map((cat) =>
        cat.item
          ? cat
          : { item: cat.value || '', label: cat.label }
      );
      return arr;
    }
    return [
      { item: "financial", label: "Financial" },
      { item: "career", label: "Career" },
      { item: "education", label: "Education" },
      { item: "health", label: "Health & Fitness" },
      { item: "personal", label: "Personal Development" },
      { item: "family", label: "Family" },
      { item: "other", label: "Other" }
    ];
  });
  
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{ item: string, label: string }>({ item: "", label: "" });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [showImported, setShowImported] = useState(false);
  const [importableItems, setImportableItems] = useState<Array<{id: string, name: string, category: string, source: 'income' | 'expenditure' | 'savings'}>>([]);

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

  useEffect(() => {
    const syncImportedGoals = () => {
      const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
      const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
      const savings = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
      
      let updated = false;
      
      const updatedGoals = goals.map(goal => {
        if (!goal.importedFrom) return goal;
        
        let sourceItem;
        
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
    
    syncImportedGoals();
    
    const interval = setInterval(syncImportedGoals, 60000);
    
    return () => clearInterval(interval);
  }, [goals]);
  
  const handleToggleGoal = (id: string, completed: boolean) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? {...goal, completed} : goal
    );
    
    setGoals(updatedGoals);
    localStorage.setItem("userPersonalGoals", JSON.stringify(updatedGoals));
    
    if (completed) {
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
    if (!newCategory.item || !newCategory.label) {
      toast({
        title: "Invalid category",
        description: "Please provide both an item and label for the category.",
        variant: "destructive"
      });
      return;
    }
    if (categories.some(cat => cat.item === newCategory.item)) {
      toast({
        title: "Category already exists",
        description: "A category with this item already exists.",
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
    setNewCategory({ item: "", label: "" });
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
  
  const now = new Date();
  const upcomingDeadlines = goals.filter(goal => {
    if (!goal.deadline || goal.completed) return false;
    const deadlineDate = new Date(goal.deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial goals
          </p>
        </div>
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default"
              className="flex items-center gap-2 px-6 py-3 text-base"
              onClick={() => {
                resetGoalForm();
                setEditingGoalId(null);
                setIsGoalDialogOpen(true);
              }}
            >
              <Plus className="h-5 w-5" /> Add Personal Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add Personal Goal</DialogTitle>
              <DialogDescription>
                Describe the details of your personal goal below
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="import">Import from</Label>
                <Select
                  onValueChange={(value) => {
                    const selectedItem = importableItems.find(item => `${item.source}-${item.id}` === value);
                    if (selectedItem) {
                      handleImportItem(selectedItem);
                    }
                  }}
                >
                  <SelectTrigger id="import" className="h-12 text-base">
                    <SelectValue placeholder="Select item to import (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Income Items</SelectLabel>
                      {importableItems.filter(item => item.source === 'income').map(item => (
                        <SelectItem key={`income-${item.id}`} value={`income-${item.id}`}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Expenditure Items</SelectLabel>
                      {importableItems.filter(item => item.source === 'expenditure').map(item => (
                        <SelectItem key={`expenditure-${item.id}`} value={`expenditure-${item.id}`}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Savings Items</SelectLabel>
                      {importableItems.filter(item => item.source === 'savings').map(item => (
                        <SelectItem key={`savings-${item.id}`} value={`savings-${item.id}`}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="h-12 text-base"
                  autoComplete="off"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                >
                  <SelectTrigger id="category" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.item} value={category.item}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <DatePicker 
                  date={newGoal.deadline ? new Date(newGoal.deadline) : undefined}
                  setDate={(date) => setNewGoal({ ...newGoal, deadline: date ? date.toISOString() : undefined })}
                  className="w-full"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={newGoal.notes || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                  className="h-12 text-base"
                  autoComplete="off"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleAddGoal} 
                disabled={isLoading}
                className="w-full sm:w-auto h-12"
              >
                {isLoading ? "Processing..." : editingGoalId ? "Update Goal" : "Add Personal Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                const categoryGoals = goals.filter(goal => goal.category === category.item);
                if (categoryGoals.length === 0) return null;
                
                return (
                  <div key={category.item}>
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
          
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Manage Goal Categories</DialogTitle>
                <DialogDescription>
                  Add or modify goal categories
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Categories</h3>
                  <div
                    className="max-h-32 h-32 overflow-y-auto bg-muted rounded-md border p-2"
                  >
                    {categories.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {categories.map((category) => (
                          <div key={category.item} className="flex justify-between items-center p-2 bg-background rounded min-h-[32px]">
                            <span>{category.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center">No categories defined.</div>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Add New Category</h3>
                  <div className="grid gap-4 p-6 bg-background rounded-lg shadow-sm" style={{ minHeight: 160 }}>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="categoryItem" className="text-right text-xs">
                        Item
                      </Label>
                      <Input
                        id="categoryItem"
                        value={newCategory.item ?? ""}
                        onChange={(e) => setNewCategory({ ...newCategory, item: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        className="col-span-3 h-12 text-base"
                        placeholder="e.g. health"
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="categoryLabel" className="text-right text-xs">
                        Label
                      </Label>
                      <Input
                        id="categoryLabel"
                        value={newCategory.label}
                        onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                        className="col-span-3 h-12 text-base"
                        placeholder="e.g. Health Goals"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex justify-end col-span-4 mt-2">
                      <Button
                        onClick={handleAddCategory}
                        className="w-full sm:w-auto h-12 mt-1 bg-primary text-primary-foreground"
                        size="lg"
                        type="button"
                      >
                        Add Category
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
