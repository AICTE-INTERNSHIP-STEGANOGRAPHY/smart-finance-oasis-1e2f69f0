
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <DollarSign className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-center">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <HomeIcon size={16} />
          Return to Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
