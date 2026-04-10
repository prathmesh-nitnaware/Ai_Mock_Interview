import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* The 'future' props opt into React Router v7 behavior.
        v7_startTransition: Wraps state updates in React.startTransition.
        v7_relativeSplatPath: Changes splat route resolution to be relative to the parent.
    */}
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);