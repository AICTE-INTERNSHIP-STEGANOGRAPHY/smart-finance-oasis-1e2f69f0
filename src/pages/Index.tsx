
import { Navigate } from "react-router-dom";

// This is now just a redirect page to the dashboard
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
