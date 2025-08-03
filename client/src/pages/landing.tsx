import React from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-neutral-800 mb-6">
            NextEra Estate
          </h1>
          <p className="text-2xl text-neutral-600 mb-8 max-w-4xl mx-auto">
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
              📊 50-State Compliance
            </span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
              💝 AI Grief Counseling
            </span>
            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
              📹 Video Messages
            </span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <a 
              href="/dashboard" 
              className="block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              🚀 Access Dashboard
            </a>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/will-builder" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                📝 Build Your Will
              </a>
              <a 
                href="/grief-counseling" 
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                💙 AI Grief Support
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-3">AI Will Builder</h3>
            <p className="text-neutral-600">
              Advanced AI guides you through creating legally compliant wills 
              with smart suggestions and voice-to-text capabilities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-3">Blockchain Security</h3>
            <p className="text-neutral-600">
              Every document and event is notarized on the blockchain 
              for tamper-proof verification and security.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold mb-3">50-State Compliance</h3>
            <p className="text-neutral-600">
              Real-time legal compliance checking across all 50 states 
              with automatic updates for changing laws.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="text-xl font-bold mb-3">AI Grief Counseling</h3>
            <p className="text-neutral-600">
              Compassionate AI-powered grief counseling available 24/7 
              for families dealing with loss.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-bold mb-3">Video Messages</h3>
            <p className="text-neutral-600">
              Record personal video messages for family members 
              to be delivered at the right time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3">Death Switch</h3>
            <p className="text-neutral-600">
              Automated legacy protection that monitors for inactivity 
              and triggers estate distribution accordingly.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-8">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-neutral-200">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="text-4xl font-bold mb-6 text-blue-600">$9.99<span className="text-lg text-neutral-600">/mo</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ AI Will Builder</li>
                <li>✅ 5GB Secure Storage</li>
                <li>✅ 2 Video Messages</li>
                <li>✅ Death Switch Monitoring</li>
                <li>✅ Blockchain Notarization</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500">
              <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm mb-4">Most Popular</div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="text-4xl font-bold mb-6 text-green-600">$19.99<span className="text-lg text-neutral-600">/mo</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Everything in Basic</li>
                <li>✅ Unlimited Storage</li>
                <li>✅ Unlimited Video Messages</li>
                <li>✅ 50-State Legal Compliance</li>
                <li>✅ AI Grief Counseling</li>
                <li>✅ Priority Support</li>
              </ul>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                Choose Premium
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-purple-500">
              <h3 className="text-2xl font-bold mb-4">Family</h3>
              <div className="text-4xl font-bold mb-6 text-purple-600">$29.99<span className="text-lg text-neutral-600">/mo</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Everything in Premium</li>
                <li>✅ Up to 12 Family Members</li>
                <li>✅ Family Communication Center</li>
                <li>✅ Legal Consultation Credits</li>
                <li>✅ Dedicated Account Manager</li>
                <li>✅ Multi-Will Management</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
                Choose Family
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-neutral-600">
          <p className="mb-4">
            © 2024 NextEra Estate. Secure, AI-powered estate planning for the digital age.
          </p>
          <div className="space-x-6">
            <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-blue-600">Terms of Service</a>
            <a href="/contact" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
