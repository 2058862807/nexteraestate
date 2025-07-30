import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Users, FileText, Lock, CheckCircle } from "lucide-react";
import { BrandLogo, BrandHero } from "@/components/DynamicBranding";

export default function Landing() {
  const handleDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleWillBuilder = () => {
    window.location.href = "/will-builder";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BrandLogo />
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <a href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-800 font-medium">
                  Dashboard
                </a>
                <a href="/will-builder" className="text-sm text-neutral-600 hover:text-neutral-800 font-medium">
                  Will Builder
                </a>
                <a href="/digital-vault" className="text-sm text-neutral-600 hover:text-neutral-800 font-medium">
                  Digital Vault
                </a>
                <a href="/family" className="text-sm text-neutral-600 hover:text-neutral-800 font-medium">
                  Family
                </a>
                <div className="flex items-center space-x-2">
                  <Lock className="text-secondary h-4 w-4" />
                  <span className="text-sm text-neutral-600">Secure Platform</span>
                </div>
              </div>
              <Button onClick={handleDashboard} className="bg-primary hover:bg-blue-700">
                Enter Platform
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BrandHero />
          
          <div className="flex flex-col items-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleWillBuilder} size="lg" className="bg-primary hover:bg-blue-700 text-lg px-8 py-4 w-full sm:w-auto">
              Start Your Estate Plan
            </Button>
            <Button onClick={handleDashboard} size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
              Enter Platform
            </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-neutral-600">
              <div className="flex items-center">
              <CheckCircle className="text-secondary h-5 w-5 mr-2" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-secondary h-5 w-5 mr-2" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-secondary h-5 w-5 mr-2" />
              <span>Legal in All 50 States</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Everything You Need for Peace of Mind
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our AI-powered platform combines legal expertise with cutting-edge technology to make estate planning simple, secure, and accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 trust-shadow">
              <CardContent className="pt-6">
                <FileText className="text-primary h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">AI Will Builder</h3>
                <p className="text-neutral-600">
                  Create legally valid wills in minutes with our AI-powered guidance and 50-state legal compliance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 trust-shadow">
              <CardContent className="pt-6">
                <Shield className="text-secondary h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Secure Digital Vault</h3>
                <p className="text-neutral-600">
                  Store and organize important documents with military-grade encryption and AI-powered categorization.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 trust-shadow">
              <CardContent className="pt-6">
                <Users className="text-accent h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Family Management</h3>
                <p className="text-neutral-600">
                  Coordinate with family members, assign roles, and manage access with intelligent notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 trust-shadow">
              <CardContent className="pt-6">
                <Heart className="text-red-500 h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Legacy Protection</h3>
                <p className="text-neutral-600">
                  Automated systems ensure your wishes are carried out and your family is notified when needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Protect Your Family Today
            </h2>
            <p className="text-xl text-neutral-600">
              Affordable plans that grow with your needs. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 trust-shadow">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Basic</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  $9.99<span className="text-lg text-neutral-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Will builder</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>5GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>2 video messages</span>
                  </li>
                </ul>
                <Button onClick={() => window.location.href = '/subscribe'} className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="p-6 trust-shadow border-2 border-primary">
              <CardContent className="pt-6">
                <div className="bg-primary text-white text-sm font-medium py-1 px-3 rounded-full mb-4 inline-block">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  $19.99<span className="text-lg text-neutral-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Unlimited storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Unlimited video messages</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Trust creation</span>
                  </li>
                </ul>
                <Button onClick={() => window.location.href = '/subscribe'} className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="p-6 trust-shadow">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Family</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  $29.99<span className="text-lg text-neutral-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Up to 6 family members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Collaborative planning</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-secondary h-5 w-5 mr-2" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button onClick={() => window.location.href = '/subscribe'} className="w-full">Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="text-primary h-8 w-8 mr-3" />
              <span className="font-bold text-xl">NoDoubtEstate</span>
            </div>
            <div className="text-sm text-neutral-400">
              © 2025 NoDoubtEstate. All rights reserved. | Privacy Policy | Terms of Service
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
