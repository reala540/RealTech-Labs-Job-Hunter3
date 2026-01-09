import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --color-primary: #10b981;
          --color-primary-dark: #059669;
          --color-background: #f8fafc;
          --color-surface: #ffffff;
          --color-text: #0f172a;
          --color-text-muted: #64748b;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Selection */
        ::selection {
          background: rgba(16, 185, 129, 0.2);
          color: #0f172a;
        }
        
        /* Focus styles */
        *:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
        
        /* Smooth transitions */
        .transition-all {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      {children}
    </div>
  );
}