import React from 'react';

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App Error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-2 break-words">Something went wrong</h2>
            <p className="text-gray-600 mb-4 break-words">NoDoubtEstate encountered an unexpected error. Please reload the application.</p>
            <button 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              onClick={() => location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}