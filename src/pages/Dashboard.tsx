
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { CreditCard, DollarSign, TrendingUp, Wallet, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { DatePickerWithRange } from "@/components/forms/DatePickerWithRange";
import { ProgressCard } from "@/components/dashboard/ProgressCard";

// Mock data for the chart
const chartData = [
  { name: "Jan", income: 3000, expenses: 2100, savings: 900 },
  { name: "Feb", income: 3200, expenses: 2300, savings: 900 },
  { name: "Mar", income: 2800, expenses: 2000, savings: 800 },
  { name: "Apr", income: 3600, expenses: 2400, savings: 1200 },
  { name: "May", income: 3100, expenses: 2200, savings: 900 },
  { name: "Jun", income: 3500, expenses: 2600, savings: 900 },
  { name: "Jul", income: 3700, expenses: 2500, savings: 1200 },
  { name: "Aug", income: 3400, expenses: 2800, savings: 600 },
  { name: "Sep", income: 3800, expenses: 2700, savings: 1100 },
  { name: "Oct", income: 3200, expenses: 2300, savings: 900 },
  { name: "Nov", income: 3900, expenses: 2600, savings: 1300 },
  { name: "Dec", income: 4100, expenses: 2900, savings: 1200 },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(),
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial summary and overview
          </p>
        </div>
        <DatePickerWithRange 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          className="w-full sm:w-auto"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value="$8,200"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
          trendValue="12% from last month"
          className="border-l-4 border-primary"
        />
        <StatCard
          title="Monthly Earnings"
          value="$3,900"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          trendValue="8% from last month"
          className="border-l-4 border-finance-green"
        />
        <StatCard
          title="Monthly Expenses"
          value="$2,600"
          icon={<CreditCard className="h-4 w-4" />}
          trend="down"
          trendValue="3% from last month"
          className="border-l-4 border-finance-red"
        />
        <StatCard
          title="Monthly Savings"
          value="$1,300"
          icon={<Wallet className="h-4 w-4" />}
          trend="up"
          trendValue="15% from last month"
          className="border-l-4 border-finance-blue"
        />
      </div>
      
      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceChart 
          title="Financial Overview" 
          description="Income, expenses and savings" 
          data={chartData} 
        />
        
        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryCard
            title="Earnings"
            icon={<TrendingUp className="h-4 w-4" />}
            amount={42500}
            status={{ type: "success", label: "Goal reached: +$2,500" }}
            path="/earnings"
            bgColor="bg-finance-green"
          />
          <CategoryCard
            title="Expenditures"
            icon={<CreditCard className="h-4 w-4" />}
            amount={31200}
            status={{ type: "warning", label: "Limit: $30,000" }}
            path="/expenditures"
            bgColor="bg-finance-red"
          />
          <CategoryCard
            title="Savings"
            icon={<Wallet className="h-4 w-4" />}
            amount={11300}
            status={{ type: "success", label: "Goal: $10,000" }}
            path="/savings"
            bgColor="bg-finance-blue"
          />
          <CategoryCard
            title="Personal Goals"
            icon={<CalendarCheck className="h-4 w-4" />}
            amount={0}
            path="/goals"
            bgColor="bg-finance-purple"
          />
        </div>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3">
        <ProgressCard
          title="Monthly Savings Goal"
          value={1300}
          target={1500}
          icon={<Wallet className="h-4 w-4" />}
          variant="default"
        />
        <ProgressCard
          title="Emergency Fund"
          value={6500}
          target={10000}
          icon={<Wallet className="h-4 w-4" />}
          variant="default"
        />
        <ProgressCard
          title="Entertainment Budget"
          value={450}
          target={400}
          icon={<CreditCard className="h-4 w-4" />}
          variant="warning"
        />
      </div>
    </div>
  );
}
