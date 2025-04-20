
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  occupation?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, occupation?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  requirePassword: boolean;
  setRequirePassword: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requirePassword, setRequirePassword] = useState(false);
  const navigate = useNavigate();
  
  // Mock authentication for demonstration purposes
  // In a real app, you would integrate with a backend authentication service
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("financeUser");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
    
    setLoading(false);
  }, []);
  
  const signUp = async (email: string, password: string, name: string, occupation?: string) => {
    setLoading(true);
    
    try {
      // Mock signup - in a real app, this would call an API
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        occupation,
        createdAt: new Date(),
      };
      
      // Store in localStorage for demo purposes
      localStorage.setItem("financeUser", JSON.stringify(newUser));
      localStorage.setItem(`password_${email}`, password);
      
      setUser(newUser);
      navigate("/");
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to Smart Finance Oasis.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock login - in a real app, this would call an API
      const storedPassword = localStorage.getItem(`password_${email}`);
      const storedUser = localStorage.getItem("financeUser");
      
      if (!storedPassword || !storedUser) {
        throw new Error("Invalid credentials");
      }
      
      if (password !== storedPassword) {
        throw new Error("Invalid password");
      }
      
      const userData = JSON.parse(storedUser);
      setUser(userData);
      navigate("/");
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = () => {
    setUser(null);
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };
  
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    requirePassword,
    setRequirePassword,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
