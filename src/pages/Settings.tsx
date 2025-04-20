
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/ModeToggle";

export default function Settings() {
  const { requirePassword, setRequirePassword } = useAuth();
  const { currency, setCurrency } = useCurrency();
  
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    weeklyReport: true,
    budgetAlerts: true,
    goalProgress: true,
  });
  
  const [selectedCountry, setSelectedCountry] = useState("US");
  
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
    
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    toast({
      title: "Currency updated",
      description: `Your currency has been changed to ${value}.`,
    });
  };
  
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    
    // Automatically set currency based on country
    switch(value) {
      case "US": handleCurrencyChange("USD"); break;
      case "CA": handleCurrencyChange("CAD"); break;
      case "GB": handleCurrencyChange("GBP"); break;
      case "EU": handleCurrencyChange("EUR"); break;
      case "JP": handleCurrencyChange("JPY"); break;
      case "AU": handleCurrencyChange("AUD"); break;
      case "IN": handleCurrencyChange("INR"); break;
      case "CN": handleCurrencyChange("CNY"); break;
      case "BR": handleCurrencyChange("BRL"); break;
      case "RU": handleCurrencyChange("RUB"); break;
      case "ZA": handleCurrencyChange("ZAR"); break;
      case "NG": handleCurrencyChange("NGN"); break;
      case "MX": handleCurrencyChange("MXN"); break;
      default: handleCurrencyChange("USD");
    }
    
    toast({
      title: "Country updated",
      description: `Your country has been changed and currency updated accordingly.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme
                </p>
              </div>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Location & Currency</CardTitle>
            <CardDescription>
              Set your country and currency preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="country">Country</Label>
                <p className="text-sm text-muted-foreground">
                  Select your country of residence
                </p>
              </div>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="RU">Russia</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="currency">Currency</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred currency
                </p>
              </div>
              <Select
                value={currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                  <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="CNY">Chinese Yuan (¥)</SelectItem>
                  <SelectItem value="BRL">Brazilian Real (R$)</SelectItem>
                  <SelectItem value="RUB">Russian Ruble (₽)</SelectItem>
                  <SelectItem value="ZAR">South African Rand (R)</SelectItem>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="MXN">Mexican Peso (Mex$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-protection">Password Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require password to open the app
                </p>
              </div>
              <Switch
                id="password-protection"
                checked={requirePassword}
                onCheckedChange={(checked) => {
                  setRequirePassword(checked);
                  toast({
                    title: "Password protection updated",
                    description: checked
                      ? "Password protection enabled"
                      : "Password protection disabled",
                  });
                }}
              />
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange("email")}
              />
            </div>
            
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="app-notifications">App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the app
                </p>
              </div>
              <Switch
                id="app-notifications"
                checked={notifications.app}
                onCheckedChange={() => handleNotificationChange("app")}
              />
            </div>
            
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-report">Weekly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly financial summary
                </p>
              </div>
              <Switch
                id="weekly-report"
                checked={notifications.weeklyReport}
                onCheckedChange={() => handleNotificationChange("weeklyReport")}
              />
            </div>
            
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Limit Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you approach budget limits
                </p>
              </div>
              <Switch
                id="budget-alerts"
                checked={notifications.budgetAlerts}
                onCheckedChange={() => handleNotificationChange("budgetAlerts")}
              />
            </div>
            
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-progress">Goal Progress Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about your savings goals
                </p>
              </div>
              <Switch
                id="goal-progress"
                checked={notifications.goalProgress}
                onCheckedChange={() => handleNotificationChange("goalProgress")}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save notification settings</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings and linked accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Connect Payment Account</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
