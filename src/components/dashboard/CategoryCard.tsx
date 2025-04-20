
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  icon: ReactNode;
  amount: number;
  status?: {
    type: "warning" | "success";
    label: string;
  };
  path: string;
  className?: string;
  bgColor?: string;
}

export function CategoryCard({
  title,
  icon,
  amount,
  status,
  path,
  className,
  bgColor,
}: CategoryCardProps) {
  return (
    <Link to={path}>
      <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
        <div className={cn("h-2", bgColor)} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                ${amount.toLocaleString()}
              </p>
              {status && (
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-2",
                    status.type === "warning" ? "border-finance-red/50 bg-finance-red/10 text-finance-red" : 
                    "border-finance-green/50 bg-finance-green/10 text-finance-green"
                  )}
                >
                  {status.label}
                </Badge>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
