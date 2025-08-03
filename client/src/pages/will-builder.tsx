// Simple will builder page without complex dependencies
import React from 'react';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
});

const executorSchema = z.object({
  name: z.string().min(2, "Executor name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Phone number is required"),
});

const assetSchema = z.object({
  description: z.string().min(5, "Asset description is required"),
  estimatedValue: z.string().min(1, "Estimated value is required"),
  beneficiary: z.string().min(2, "Beneficiary is required"),
  percentage: z.string().min(1, "Percentage is required"),
});

const steps = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Executors & Guardians", icon: Users },
  { id: 3, title: "Asset Distribution", icon: Home },
  { id: 4, title: "Review & Finalize", icon: FileSignature },
];

// Will Template Button Component
interface WillTemplateButtonProps {
  title: string;
  description: string;
  example: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
  onClick: (text: string) => void;
}

function WillTemplateButton({ title, description, example, color, onClick }: WillTemplateButtonProps) {
  const colorClasses = {
    green: 'bg-green-100 border-green-300 hover:bg-green-200 text-green-800',
    blue: 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800',
    purple: 'bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800',
    orange: 'bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800'
  };

  return (
    <button
      onClick={() => onClick(example)}
      className={`w-full p-8 border-4 rounded-2xl text-left transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl ${colorClasses[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-lg opacity-80">{description}</p>
        </div>
        <div className="text-4xl">→</div>
      </div>
      
      <div className="bg-white bg-opacity-60 p-4 rounded-lg border border-gray-200">
        <p className="text-sm italic text-gray-700">
          Will preview: "{example.substring(0, 120)}..."
        </p>
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-xl font-bold">CLICK TO CREATE WILL</span>
      </div>
    </button>
  );
}

export default function WillBuilder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            AI Will Builder
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Create your legally compliant will with AI guidance and 50-state compliance checking
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">🤖 AI-Powered Will Creation</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Smart Suggestions</h3>
                    <p className="text-blue-700 text-sm">AI analyzes your situation and provides personalized recommendations</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Legal Compliance</h3>
                    <p className="text-green-700 text-sm">Automatic checking across all 50 states with real-time updates</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Blockchain Security</h3>
                    <p className="text-purple-700 text-sm">Every change is notarized on the blockchain for security</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">📝 Will Building Options</h2>
                <div className="space-y-4">
                  <a href="/will-builder/simple" className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg border transition-colors">
                    <h3 className="font-semibold">Simple Will Builder</h3>
                    <p className="text-neutral-600 text-sm">Quick and easy will creation for straightforward estates</p>
                  </a>
                  <a href="/will-builder/ai" className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                    <h3 className="font-semibold text-blue-800">AI-Enhanced Builder</h3>
                    <p className="text-blue-700 text-sm">Advanced AI guidance with smart suggestions and voice input</p>
                  </a>
                  <a href="/will-builder/voice" className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                    <h3 className="font-semibold text-green-800">Voice-to-Will</h3>
                    <p className="text-green-700 text-sm">Speak your wishes and let AI convert them to legal language</p>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a href="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
