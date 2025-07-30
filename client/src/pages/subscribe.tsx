import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Users, FileText, Heart, Crown } from "lucide-react";

// Load Stripe with error handling
const getStripePromise = () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('Stripe public key not found, payment features will be disabled');
    return null;
  }
  return loadStripe(publicKey);
};

const stripePromise = getStripePromise();

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe} 
        className="w-full bg-primary text-white hover:bg-blue-700"
      >
        Subscribe Now
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$9.99",
      period: "/month",
      yearlyPrice: "$99",
      yearlyPeriod: "/year",
      description: "Perfect for individuals starting their estate planning journey",
      features: [
        "Smart will builder",
        "5GB secure storage",
        "2 video messages",
        "Basic executor management",
        "Email support",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.99",
      period: "/month",
      yearlyPrice: "$199",
      yearlyPeriod: "/year",
      description: "Most popular choice for comprehensive estate planning",
      features: [
        "Everything in Basic",
        "Unlimited secure storage",
        "Unlimited video messages",
        "Trust creation tools",
        "Advanced sharing controls",
        "Priority email support",
        "Death switch monitoring",
      ],
      popular: true,
    },
    {
      id: "family",
      name: "Family",
      price: "$29.99",
      period: "/month",
      yearlyPrice: "$299",
      yearlyPeriod: "/year",
      description: "Complete solution for families with multiple members",
      features: [
        "Everything in Premium",
        "Up to 6 family members",
        "Collaborative planning tools",
        "Family communication center",
        "Priority phone support",
        "Dedicated account manager",
        "Legal consultation credits",
      ],
      popular: false,
    },
  ];

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { planId });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="trust-shadow">
            <CardHeader>
              <CardTitle className="text-center">Complete Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Secure your family's future with our comprehensive estate planning platform. 
            Start with a free trial, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative trust-shadow hover:shadow-lg gentle-transition ${
                plan.popular ? 'border-2 border-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-6 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-800">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-neutral-600">{plan.period}</span>
                </div>
                <div className="text-sm text-neutral-600">
                  or {plan.yearlyPrice}{plan.yearlyPeriod} (save 17%)
                </div>
                <p className="text-neutral-600 mt-4">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isLoading}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary text-white hover:bg-blue-700' 
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="trust-shadow mb-12">
          <CardHeader>
            <CardTitle className="text-center">Why Choose LifeMap?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-800 mb-2">Bank-Grade Security</h3>
                <p className="text-sm text-neutral-600">
                  AES-256 encryption and SOC 2 compliance protect your sensitive information.
                </p>
              </div>
              
              <div className="text-center">
                <FileText className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-800 mb-2">Legally Valid</h3>
                <p className="text-sm text-neutral-600">
                  Our wills meet legal requirements in all 50 states with expert legal review.
                </p>
              </div>
              
              <div className="text-center">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-800 mb-2">Family Collaboration</h3>
                <p className="text-sm text-neutral-600">
                  Involve your family in the planning process with secure sharing and communication.
                </p>
              </div>
              
              <div className="text-center">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-800 mb-2">Peace of Mind</h3>
                <p className="text-sm text-neutral-600">
                  Know that your loved ones will be taken care of exactly as you intended.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <Card className="trust-shadow bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                Trusted by Thousands of Families
              </h3>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Join the growing community of families who have secured their legacy with LifeMap.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-neutral-600">Wills Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">99.9%</div>
                <div className="text-neutral-600">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                <div className="text-neutral-600">Support Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            Questions? We're Here to Help
          </h3>
          <p className="text-neutral-600 mb-6">
            Our expert team is available to answer your questions about estate planning and our platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View FAQ
            </Button>
            <Button className="bg-secondary text-white hover:bg-green-700">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
