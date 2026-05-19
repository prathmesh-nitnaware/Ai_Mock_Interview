import React from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Routing
import AppRoutes from "./routes/AppRoutes";

// Styles
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-root">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
