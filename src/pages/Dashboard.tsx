
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { CreditCard, DollarSign, TrendingUp, Wallet, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { DatePickerWithRange } from "@/components/forms/DatePickerWithRange";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";

export default function Dashboard() {
  const { currency } = useCurrency();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  
  // State for financial data
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Fetch data from local storage
  useEffect(() => {
    // Get data from local storage
    const incomes = JSON.parse(localStorage.getItem("userIncomes") || "[]");
    const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
    const savingsGoals = JSON.parse(localStorage.getItem("userSavingsGoals") || "[]");
    const personalGoals = JSON.parse(localStorage.getItem("userPersonalGoals") || "[]");
    
    // Calculate total income
    const totalIncome = incomes.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
    
    // Calculate balance and savings
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = savingsGoals.reduce((sum: number, item: any) => sum + parseFloat(item.currentAmount || 0), 0);
    
    // Calculate completed and total personal goals
    const completedPersonalGoals = personalGoals.filter((goal: any) => goal.completed).length;
    const totalPersonalGoals = personalGoals.length;
    
    // Update state
    setBalance(totalBalance);
    setMonthlyIncome(totalIncome);
    setMonthlyExpenses(totalExpenses);
    setMonthlySavings(totalSavings);
    setCompletedGoals(completedPersonalGoals);
    setTotalGoals(totalPersonalGoals);
    
    // Generate chart data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate monthly data based on actual records
    const newChartData = months.map((month, index) => {
      // Filter transactions for this month
      const monthStart = new Date(currentYear, index, 1);
      const monthEnd = new Date(currentYear, index + 1, 0);
      
      // Calculate month's income
      const monthIncome = incomes
        .filter((item: any) => {
          const date = new Date(item.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
      
      // Calculate month's expenses
      const monthExpenses = expenses
        .filter((item: any) => {
          const date = new Date(item.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
      
      // Calculate savings (income - expenses)
      const monthSavings = monthIncome - monthExpenses;
      
      return {
        name: month,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings
      };
    });
    
    setChartData(newChartData);
    
  }, [dateRange]); // Re-calculate when date range changes
  
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
          value={formatMoney(balance, currency)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={balance >= 0 ? "up" : "down"}
          trendValue={balance >= 0 ? "Current net worth" : "Net debt position"}
          className="border-l-4 border-primary"
        />
        <StatCard
          title="Monthly Income"
          value={formatMoney(monthlyIncome, currency)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          trendValue="Total monthly earnings"
          className="border-l-4 border-finance-green"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatMoney(monthlyExpenses, currency)}
          icon={<CreditCard className="h-4 w-4" />}
          trend="down"
          trendValue="Total monthly spending"
          className="border-l-4 border-finance-red"
        />
        <StatCard
          title="Monthly Savings"
          value={formatMoney(monthlySavings, currency)}
          icon={<Wallet className="h-4 w-4" />}
          trend={monthlySavings >= 0 ? "up" : "down"}
          trendValue={monthlySavings >= 0 ? "Net monthly savings" : "Negative savings"}
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
            title="Income"
            icon={<TrendingUp className="h-4 w-4" />}
            amount={monthlyIncome}
            status={{ type: "success", label: "Monthly earnings" }}
            path="/earnings"
            bgColor="bg-finance-green"
          />
          <CategoryCard
            title="Expenditures"
            icon={<CreditCard className="h-4 w-4" />}
            amount={monthlyExpenses}
            status={{ type: "warning", label: "Monthly spending" }}
            path="/expenditures"
            bgColor="bg-finance-red"
          />
          <CategoryCard
            title="Savings"
            icon={<Wallet className="h-4 w-4" />}
            amount={monthlySavings}
            status={{ type: monthlySavings >= 0 ? "success" : "warning", label: monthlySavings >= 0 ? "Monthly savings" : "Negative savings" }}
            path="/savings"
            bgColor="bg-finance-blue"
          />
          <CategoryCard
            title="Personal Goals"
            icon={<CalendarCheck className="h-4 w-4" />}
            amount={completedGoals}
            status={{ type: "success", label: "Goals completed" }}
            path="/goals"
            bgColor="bg-finance-purple"
            displayValue={`${completedGoals}/${totalGoals}`}
          />
        </div>
      </div>
    </div>
  );
}
