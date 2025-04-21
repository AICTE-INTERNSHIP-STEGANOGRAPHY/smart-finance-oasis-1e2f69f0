
import { Navigate } from "react-router-dom";

// This is a redirect page to the AI Finance Assistant
const Index = () => {
  return <Navigate to="/suggestions" replace />;
};

export default Index;
