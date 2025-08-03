import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-neutral-800 mb-6">
              NextEra Estate
            </h1>
            <p className="text-2xl md:text-3xl text-neutral-600 mb-8 leading-relaxed">
              AI-Powered Estate Planning with Blockchain Security,<br />
              50-State Legal Compliance, and AI Grief Counseling
            </p>
            
            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
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
          </div>

          {/* Revolutionary Platform Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-8">
              Revolutionary Estate Planning Platform
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-blue-600 mb-3">AI-Powered</h3>
                <p className="text-neutral-600">
                  Advanced AI guides you through will creation with smart suggestions and voice-to-text capabilities
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-green-600 mb-3">Blockchain Secured</h3>
                <p className="text-neutral-600">
                  Every document notarized on blockchain for tamper-proof verification and security
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold text-purple-600 mb-3">Legal Compliant</h3>
                <p className="text-neutral-600">
                  Real-time compliance checking across all 50 US states with automatic legal updates
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h3 className="text-4xl font-bold text-neutral-800 mb-8">Simple, Transparent Pricing</h3>
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Basic Plan */}
              <div className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-bold text-neutral-800 mb-2">Basic</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">$9.99</span>
                  <span className="text-neutral-600">/month</span>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    AI Will Builder
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    5GB Secure Storage
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    2 Video Messages
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Death Switch Monitoring
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Blockchain Notarization
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Get Started
                </button>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-green-500 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-neutral-800 mb-2">Premium</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-green-600">$19.99</span>
                  <span className="text-neutral-600">/month</span>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Everything in Basic
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Unlimited Storage
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Unlimited Video Messages
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    50-State Legal Compliance
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    AI Grief Counseling
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Priority Support
                  </li>
                </ul>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Choose Premium
                </button>
              </div>

              {/* Family Plan */}
              <div className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-bold text-neutral-800 mb-2">Family</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-purple-600">$29.99</span>
                  <span className="text-neutral-600">/month</span>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Everything in Premium
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Up to 12 Family Members
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Family Communication Center
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Legal Consultation Credits
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    Multi-Will Management
                  </li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                  Choose Family
                </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-neutral-800 mb-6">
              Ready to Secure Your Legacy?
            </h3>
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

          {/* Footer */}
          <div className="text-center text-neutral-600">
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">
                🏆 Trusted by thousands of families • 🔒 Bank-level security • ⚖️ Legal compliance guaranteed
              </p>
            </div>
            <p className="text-sm opacity-75">
              © 2024 NextEra Estate. The future of AI-powered estate planning with blockchain security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;