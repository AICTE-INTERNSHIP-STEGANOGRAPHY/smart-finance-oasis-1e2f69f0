import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([
    { id: 1, title: 'Invest in Stocks', description: 'Consider investing in stocks for long-term growth.', category: 'Financial' },
    { id: 2, title: 'Learn a New Language', description: 'Learning a new language can open up new opportunities.', category: 'Personal Development' },
  ]);

  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: '',
    category: 'Financial',
  });

  const [categories, setCategories] = useState(['Financial', 'Personal Development', 'Career']);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: string) => {
    setNewSuggestion({ ...newSuggestion, [key]: e.target.value });
  };

  const handleCategoryChange = (category: string) => {
    setNewSuggestion({ ...newSuggestion, category });
  };

  const addSuggestion = () => {
    if (newSuggestion.title && newSuggestion.description && newSuggestion.category) {
      setSuggestions([...suggestions, { ...newSuggestion, id: Date.now() }]);
      setNewSuggestion({ title: '', description: '', category: 'Financial' });
    }
  };

  const totalSuggestions = suggestions.length;
  const financialSuggestions = suggestions.filter(suggestion => suggestion.category === 'Financial').length;
  const personalDevelopmentSuggestions = suggestions.filter(suggestion => suggestion.category === 'Personal Development').length;
  const careerSuggestions = suggestions.filter(suggestion => suggestion.category === 'Career').length;

  const financialPercentage = totalSuggestions > 0 ? (financialSuggestions / totalSuggestions) * 100 : 0;
  const personalDevelopmentPercentage = totalSuggestions > 0 ? (personalDevelopmentSuggestions / totalSuggestions) * 100 : 0;
  const careerPercentage = totalSuggestions > 0 ? (careerSuggestions / totalSuggestions) * 100 : 0;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suggestions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Suggestion</CardTitle>
            <CardDescription>Add a new suggestion to the list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={newSuggestion.title}
                onChange={(e) => handleInputChange(e, 'title')}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                value={newSuggestion.description}
                onChange={(e) => handleInputChange(e, 'description')}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={newSuggestion.category} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSuggestion}>Add Suggestion</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>See the distribution of suggestions by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span>Financial</span>
                <span>{financialSuggestions}</span>
              </div>
              <Progress value={financialPercentage} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Personal Development</span>
                <span>{personalDevelopmentSuggestions}</span>
              </div>
              <Progress value={personalDevelopmentPercentage} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Career</span>
                <span>{careerSuggestions}</span>
              </div>
              <Progress value={careerPercentage} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suggestion List</CardTitle>
          <CardDescription>List of all suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-none space-y-2">
            {suggestions.map(suggestion => (
              <li key={suggestion.id} className="border p-2 rounded">
                <h3 className="font-bold">{suggestion.title}</h3>
                <p>{suggestion.description}</p>
                <p className="text-sm">Category: {suggestion.category}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suggestions;
