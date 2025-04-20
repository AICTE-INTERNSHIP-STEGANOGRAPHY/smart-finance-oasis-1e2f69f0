
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Notification = {
  id: string;
  type: "warning" | "success";
  title: string;
  description: string;
  date: string;
  read?: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const savedNotifications = localStorage.getItem("userNotifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const warningCount = notifications.filter(n => n.type === "warning").length;
  const successCount = notifications.filter(n => n.type === "success").length;
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "warnings") return notification.type === "warning";
    if (activeTab === "success") return notification.type === "success";
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    localStorage.setItem("userNotifications", JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("userNotifications", JSON.stringify([]));
    setIsConfirmDialogOpen(false);
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem("userNotifications", JSON.stringify(updatedNotifications));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View all your budget warnings and goal achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          
          <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your notifications. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllNotifications} className="bg-destructive text-destructive-foreground">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="relative">
            All
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="warnings" className="relative">
            Warnings
            {warningCount > 0 && (
              <Badge variant="secondary" className="ml-2">{warningCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="success" className="relative">
            Achievements
            {successCount > 0 && (
              <Badge variant="secondary" className="ml-2">{successCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {activeTab === "all" && "All Notifications"}
                {activeTab === "warnings" && "Budget Warnings"}
                {activeTab === "success" && "Goal Achievements"}
                {activeTab === "unread" && "Unread Notifications"}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length === 0
                  ? "No notifications to display"
                  : `You have ${filteredNotifications.length} ${
                      activeTab === "all" 
                        ? "notifications" 
                        : activeTab === "warnings" 
                          ? "warnings" 
                          : activeTab === "success" 
                            ? "achievements" 
                            : "unread notifications"
                    }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === "all" 
                          ? "You don't have any notifications yet" 
                          : activeTab === "warnings" 
                            ? "No budget warnings to display" 
                            : activeTab === "success" 
                              ? "No goal achievements yet" 
                              : "No unread notifications"}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read 
                            ? "bg-card" 
                            : "bg-muted"
                        } ${
                          notification.type === "warning" 
                            ? "border-amber-200 dark:border-amber-900" 
                            : "border-green-200 dark:border-green-900"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {notification.type === "warning" ? (
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <Badge variant="outline" className="ml-2 bg-primary/20">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
