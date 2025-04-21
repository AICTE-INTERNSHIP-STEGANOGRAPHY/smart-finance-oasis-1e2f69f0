
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";

export default function Security() {
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginNotifications: true,
    requirePassword: true
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm({
      ...passwordForm,
      [field]: value
    });
  };

  const handleSecurityChange = (field: string, value: boolean) => {
    setSecuritySettings({
      ...securitySettings,
      [field]: value
    });
    
    toast({
      title: "Security setting updated",
      description: `${field} has been ${value ? "enabled" : "disabled"}.`,
    });
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.new.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been successfully changed.",
    });
    
    setPasswordForm({
      current: "",
      new: "",
      confirm: ""
    });
  };

  // Utility function for password input with show/hide toggle
  const renderPasswordInput = (field: "current" | "new" | "confirm", label: string, id: string) => (
    <div className="space-y-2 relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword[field] ? "text" : "password"}
          value={passwordForm[field]}
          onChange={(e) => handlePasswordChange(field, e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-background hover:bg-muted rounded-full"
          tabIndex={-1}
          onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })}
        >
          {showPassword[field] ? 
            <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
            <Eye className="h-4 w-4 text-muted-foreground" />
          }
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderPasswordInput("current", "Current Password", "current-password")}
            {renderPasswordInput("new", "New Password", "new-password")}
            {renderPasswordInput("confirm", "Confirm New Password", "confirm-password")}
          </CardContent>
          <CardFooter>
            <Button onClick={handlePasswordSubmit}>Update Password</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={securitySettings.twoFactor}
                onCheckedChange={(checked) => 
                  handleSecurityChange("twoFactor", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="login-notifications">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when someone logs into your account
                </p>
              </div>
              <Switch
                id="login-notifications"
                checked={securitySettings.loginNotifications}
                onCheckedChange={(checked) => 
                  handleSecurityChange("loginNotifications", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-password">Require Password to Open App</Label>
                <p className="text-sm text-muted-foreground">
                  Adds password protection when opening the application
                </p>
              </div>
              <Switch
                id="require-password"
                checked={securitySettings.requirePassword}
                onCheckedChange={(checked) => 
                  handleSecurityChange("requirePassword", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
