import React from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";

// Routing
import AppRoutes from "./routes/AppRoutes";

// Styles
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
