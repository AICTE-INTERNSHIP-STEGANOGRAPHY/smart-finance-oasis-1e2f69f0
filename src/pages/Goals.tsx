
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, CalendarCheck, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Goals() {
  const [isLoading, setIsLoading] = useState(false);

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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No goals created yet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No completed goals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Deadlines
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No deadlines set
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Goal Categories</CardTitle>
          <CardDescription>Track your financial objectives by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Expenditure Goals</h3>
              <div className="pl-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-1" />
                  <Label htmlFor="goal-1">Reduce monthly food expenses by 10%</Label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Earnings Goals</h3>
              <div className="pl-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-2" />
                  <Label htmlFor="goal-2">Increase monthly income by 5%</Label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Savings Goals</h3>
              <div className="pl-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-3" />
                  <Label htmlFor="goal-3">Save 20% of monthly income</Label>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "This feature will be available in the next update."
              });
            }}
          >
            Create New Goal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
