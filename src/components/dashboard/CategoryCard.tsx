
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";
import { Link } from "react-router-dom";

type StatusType = "success" | "warning" | "info";

interface CategoryCardProps {
  title: string;
  icon: ReactNode;
  amount: number;
  status: {
    type: StatusType;
    label: string;
  };
  path: string;
  bgColor?: string;
  displayValue?: string;
}

export function CategoryCard({
  title,
  icon,
  amount,
  status,
  path,
  bgColor = "bg-muted",
  displayValue,
}: CategoryCardProps) {
  const { currency } = useCurrency();
  
  const statusClasses = {
    success: "text-finance-green",
    warning: "text-finance-red",
    info: "text-finance-blue"
  };
  
  return (
    <div className="category-card rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 flex flex-col h-full justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-full ${bgColor}`}>
              {icon}
            </span>
            <h3 className="font-medium text-base tracking-tight">{title}</h3>
          </div>
          <p className="text-2xl font-semibold">
            {displayValue || formatMoney(amount, currency)}
          </p>
          <p className={`text-xs ${statusClasses[status.type]}`}>
            {status.label}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="mt-4 w-full justify-between" asChild>
          <Link to={path}>
            View {title.toLowerCase()} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
