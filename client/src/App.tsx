import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import Landing from './pages/landing';
import AIEnhancedDashboard from './pages/ai-enhanced-dashboard';
import WillBuilder from './pages/will-builder';
import GriefCounselingPage from './pages/grief-counseling';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/dashboard" component={AIEnhancedDashboard} />
          <Route path="/will-builder" component={WillBuilder} />
          <Route path="/grief-counseling" component={GriefCounselingPage} />
          <Route>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-neutral-800 mb-4">
                  NextEra Estate
                </h1>
                <p className="text-lg text-neutral-600 mb-8">
                  AI-Powered Estate Planning with Blockchain Security
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <a 
                      href="/dashboard" 
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </a>
                    <a 
                      href="/will-builder" 
                      className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Build Will
                    </a>
                  </div>
                  <a 
                    href="/grief-counseling" 
                    className="block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors max-w-md mx-auto"
                  >
                    AI Grief Counseling
                  </a>
                </div>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
}

export default App;