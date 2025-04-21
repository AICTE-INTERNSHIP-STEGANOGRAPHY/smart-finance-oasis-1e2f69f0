
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    occupation: "",
    country: "US",
    currency: currency,
    password: "",
  });

  // Load saved profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileData(prevData => ({
        ...prevData,
        ...parsedProfile,
        currency: currency // Ensure currency is in sync with context
      }));
    }
  }, [currency]);

  const handleChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    handleChange("currency", value);
  };

  const handleSubmit = () => {
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    
    // Update currency in context
    setCurrency(profileData.currency);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage alt={profileData.name} src="" />
                <AvatarFallback className="text-xl">{profileData.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={profileData.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                showPasswordToggle
                value={profileData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Country & Currency</CardTitle>
            <CardDescription>
              Set your location and preferred currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country of Residence</Label>
              <Select
                value={profileData.country}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="RU">Russia</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={profileData.currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select a currency" />
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
          <CardFooter>
            <Button onClick={handleSubmit} className="ml-auto">Save Preferences</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
