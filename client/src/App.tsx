import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-6xl font-bold text-neutral-800 mb-6">
              NextEra Estate
            </h1>
            <p className="text-2xl text-neutral-600 mb-8">
              AI-Powered Estate Planning with Blockchain Security, 
              50-State Legal Compliance, and AI Grief Counseling
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                🤖 AI Will Builder
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                🔒 Blockchain Notarization
              </span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                📊 50-State Legal Compliance
              </span>
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                💝 AI Grief Counseling
              </span>
              <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                📹 Video Messages
              </span>
              <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
                🛡️ Death Switch Protection
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-6">
                  Revolutionary Estate Planning Platform
                </h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h3 className="font-bold text-blue-600 mb-2">🤖 AI-Powered</h3>
                    <p className="text-sm text-neutral-600">Advanced AI guides you through will creation with smart suggestions and voice-to-text capabilities</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-600 mb-2">🔗 Blockchain Secured</h3>
                    <p className="text-sm text-neutral-600">Every document notarized on blockchain for tamper-proof verification and security</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-600 mb-2">⚖️ Legal Compliant</h3>
                    <p className="text-sm text-neutral-600">Real-time compliance checking across all 50 US states with automatic legal updates</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">Simple, Transparent Pricing</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">Basic</h4>
                    <p className="text-3xl font-bold text-blue-600 mb-2">$9.99<span className="text-sm">/mo</span></p>
                    <ul className="text-sm text-left">
                      <li>✅ AI Will Builder</li>
                      <li>✅ 5GB Storage</li>
                      <li>✅ 2 Video Messages</li>
                      <li>✅ Death Switch</li>
                    </ul>
                  </div>
                  <div className="border-2 border-green-500 rounded-lg p-4">
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs mb-2">Most Popular</div>
                    <h4 className="font-bold text-lg mb-2">Premium</h4>
                    <p className="text-3xl font-bold text-green-600 mb-2">$19.99<span className="text-sm">/mo</span></p>
                    <ul className="text-sm text-left">
                      <li>✅ Everything in Basic</li>
                      <li>✅ Unlimited Storage</li>
                      <li>✅ AI Grief Counseling</li>
                      <li>✅ 50-State Compliance</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">Family</h4>
                    <p className="text-3xl font-bold text-purple-600 mb-2">$29.99<span className="text-sm">/mo</span></p>
                    <ul className="text-sm text-left">
                      <li>✅ Everything in Premium</li>
                      <li>✅ 12 Family Members</li>
                      <li>✅ Family Communication</li>
                      <li>✅ Legal Consultation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
                    🚀 Start Estate Planning
                  </button>
                  <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
                    📝 Build Your Will
                  </button>
                  <button className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition-colors text-lg font-semibold">
                    💙 AI Grief Support
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-neutral-600">
              <p className="mb-4">
                🏆 Trusted by thousands of families • 🔒 Bank-level security • ⚖️ Legal compliance guaranteed
              </p>
              <p className="text-sm">
                © 2024 NextEra Estate. The future of AI-powered estate planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;