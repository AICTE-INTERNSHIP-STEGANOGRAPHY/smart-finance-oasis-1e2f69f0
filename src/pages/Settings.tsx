
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Settings() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? savedMode === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [notifications, setNotifications] = useState(() => {
    const savedPref = localStorage.getItem("notificationsEnabled");
    return savedPref ? savedPref === "true" : true;
  });
  const [emailFrequency, setEmailFrequency] = useState(() => {
    const savedFreq = localStorage.getItem("emailFrequency");
    return savedFreq || "weekly";
  });
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testCurrency, setTestCurrency] = useState("");
  const [testAmount, setTestAmount] = useState(1000);

  useEffect(() => {
    // Update the document class when dark mode changes
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleToggleNotifications = () => {
    setNotifications((prev) => !prev);
  };

  const handleSavePreferences = () => {
    // Save all preferences to localStorage
    localStorage.setItem("notificationsEnabled", String(notifications));
    localStorage.setItem("emailFrequency", emailFrequency);
    
    // Update currency if changed
    if (selectedCurrency !== currency) {
      setCurrency(selectedCurrency);
    }
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    });
  };
  
  const getFormattedExample = (code: string, amount: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>
              Choose the currency for displaying all financial values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Currencies</SelectLabel>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name} ({curr.symbol})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <p className="text-sm text-muted-foreground mt-2">
                Example: {getFormattedExample(selectedCurrency, 1234.56)}
              </p>
              
              <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-2">
                    Test Currency Formatting
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Test Currency Formatting</DialogTitle>
                    <DialogDescription>
                      See how different currencies format the same amount
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-currency" className="text-right">
                        Currency
                      </Label>
                      <Select
                        value={testCurrency || selectedCurrency}
                        onValueChange={setTestCurrency}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Currencies</SelectLabel>
                            {availableCurrencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.code} - {curr.name} ({curr.symbol})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="test-amount"
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="border rounded-lg p-4 mt-2">
                      <p className="font-medium">Formatted Result:</p>
                      <p className="text-xl mt-2">
                        {getFormattedExample(testCurrency || selectedCurrency, testAmount)}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email-frequency">Email Frequency</Label>
              <Select
                value={emailFrequency}
                onValueChange={setEmailFrequency}
                disabled={!notifications}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Frequency</SelectLabel>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </div>
      </div>
    </div>
  );
}
