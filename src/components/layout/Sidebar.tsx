
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CreditCard,
  Settings,
  User,
  LogOut,
  TrendingUp,
  Wallet,
  PieChart,
  DollarSign,
  Shield,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleNavigation = (path: string) => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
    
    // Show a toast for unimplemented pages
    if (["/earnings", "/expenditures", "/savings", "/goals"].includes(path)) {
      if (location.pathname !== path) {
        toast({
          title: "Page Loaded",
          description: `Navigated to ${path.replace("/", "").charAt(0).toUpperCase() + path.replace("/", "").slice(1)} page`,
        });
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar text-sidebar-foreground shadow-sm transition-transform duration-300 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold" onClick={() => handleNavigation("/")}>
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="text-xl">Finance Oasis</span>
          </Link>
        </div>
        
        <ScrollArea className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="flex flex-col gap-2 p-4">
            <div className="py-2">
              <h2 className="px-3 text-xs font-medium text-muted-foreground">Dashboard</h2>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/" className="menu-item" onClick={() => handleNavigation("/")}>
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="py-2">
              <h2 className="px-3 text-xs font-medium text-muted-foreground">Finance</h2>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/earnings" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/earnings" className="menu-item" onClick={() => handleNavigation("/earnings")}>
                    <TrendingUp className="h-4 w-4" />
                    Earnings
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/expenditures" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/expenditures" className="menu-item" onClick={() => handleNavigation("/expenditures")}>
                    <CreditCard className="h-4 w-4" />
                    Expenditures
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/savings" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/savings" className="menu-item" onClick={() => handleNavigation("/savings")}>
                    <Wallet className="h-4 w-4" />
                    Savings
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/goals" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/goals" className="menu-item" onClick={() => handleNavigation("/goals")}>
                    <CalendarCheck className="h-4 w-4" />
                    Personal Goals
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="py-2">
              <h2 className="px-3 text-xs font-medium text-muted-foreground">Insights</h2>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/suggestions" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/suggestions" className="menu-item" onClick={() => handleNavigation("/suggestions")}>
                    <PieChart className="h-4 w-4" />
                    Suggestions
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="py-2">
              <h2 className="px-3 text-xs font-medium text-muted-foreground">Account</h2>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/profile" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/profile" className="menu-item" onClick={() => handleNavigation("/profile")}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/security" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/security" className="menu-item" onClick={() => handleNavigation("/security")}>
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/settings" && "bg-accent font-medium"
                  )}
                >
                  <Link to="/settings" className="menu-item" onClick={() => handleNavigation("/settings")}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground menu-item"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
