import { ReactNode } from 'react';

interface DashboardWrapperProps {
  children: ReactNode;
}

// Fixed Dashboard Wrapper Component
export function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// CSS is already in index.css with the CRITICAL OVERFLOW FIXES