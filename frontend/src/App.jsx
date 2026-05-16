import React from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";

// Routing
import AppRoutes from "./routes/AppRoutes";

// Styles - Standardizing the premium dark theme aesthetic
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      {/* 'app-root' serves as the primary layout container. 
          The 90% scale fix is applied to child page components 
          (like Dashboard, Profile, and CodingDojo) to ensure 
          a consistent, high-fidelity SaaS look.
      */}
      <div className="app-root">
         <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
