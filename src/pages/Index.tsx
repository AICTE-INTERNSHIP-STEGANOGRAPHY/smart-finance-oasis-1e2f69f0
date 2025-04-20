
import { Navigate } from "react-router-dom";

// This is just a redirect page to the dashboard
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
