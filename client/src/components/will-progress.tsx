import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileSignature, Video, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface WillProgressProps {
  will: any;
}

export default function WillProgress({ will }: WillProgressProps) {
  const getStepStatus = (step: number) => {
    if (!will) return "pending";
    
    const hasPersonalInfo = will.personalInfo;
    const hasExecutors = will.executors && will.executors.length > 0;
    const hasAssets = will.assets && will.assets.length > 0;
    const isCompleted = will.status === "completed";

    switch (step) {
      case 1: return hasPersonalInfo ? "completed" : "current";
      case 2: return hasExecutors ? "completed" : hasPersonalInfo ? "current" : "pending";
      case 3: return hasAssets ? "completed" : hasExecutors ? "current" : "pending";
      case 4: return isCompleted ? "completed" : hasAssets ? "current" : "pending";
      default: return "pending";
    }
  };

  const steps = [
    { id: 1, title: "Personal Information", status: getStepStatus(1) },
    { id: 2, title: "Executors & Guardians", status: getStepStatus(2) },
    { id: 3, title: "Asset Distribution", status: getStepStatus(3) },
    { id: 4, title: "Review & Finalize", status: getStepStatus(4) },
  ];

  const currentStep = steps.find(step => step.status === "current")?.id || 1;
  const completedSteps = steps.filter(step => step.status === "completed").length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>{completedSteps} of {steps.length} sections complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Current Step */}
      {will.status !== "completed" && (
        <Card className="border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">
                Current Step: {steps.find(s => s.id === currentStep)?.title}
              </h3>
              <Badge variant="outline" className="text-accent border-accent">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
            
            {currentStep === 1 && (
              <div>
                <p className="text-neutral-600 text-sm mb-4">
                  Let's start with your basic personal information to create your will.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-neutral-600">
                    • Full legal name and address
                  </div>
                  <div className="text-sm text-neutral-600">
                    • Date of birth and marital status
                  </div>
                  <div className="text-sm text-neutral-600">
                    • State of residence for legal compliance
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                <p className="text-neutral-600 text-sm mb-4">
                  Choose trusted individuals to execute your will and care for your dependents.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-neutral-600">
                    • Primary and backup executors
                  </div>
                  <div className="text-sm text-neutral-600">
                    • Guardians for minor children (if applicable)
                  </div>
                  <div className="text-sm text-neutral-600">
                    • Contact information and relationships
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <p className="text-neutral-600 text-sm mb-4">
                  Specify how you'd like your assets distributed among your beneficiaries.
                </p>
                {will.assets && will.assets.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {will.assets.slice(0, 2).map((asset: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <div className="font-medium text-neutral-800">{asset.description}</div>
                          <div className="text-sm text-neutral-600">
                            {asset.percentage}% to {asset.beneficiary}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 4 && (
              <div>
                <p className="text-neutral-600 text-sm mb-4">
                  Review all information and finalize your legally binding will.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-neutral-600">
                    • Review all sections for accuracy
                  </div>
                  <div className="text-sm text-neutral-600">
                    • Digital signature and witness requirements
                  </div>
                  <div className="text-sm text-neutral-600">
                    • Download and store your completed will
                  </div>
                </div>
              </div>
            )}

            <Link href="/will-builder">
              <Button className="w-full bg-primary text-white hover:bg-blue-700">
                Continue Will Builder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Video Messages Section */}
      <Card className="border border-neutral-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-neutral-800">Personal Video Messages</h3>
            <Video className="text-secondary h-5 w-5" />
          </div>
          <p className="text-neutral-600 text-sm mb-3">
            Record heartfelt messages for your loved ones.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-secondary text-white hover:bg-green-700">
              <Video className="h-4 w-4 mr-2" />
              Record Message
            </Button>
            <Button variant="outline" size="sm">
              View Saved (2)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {will.status === "completed" && (
        <Card className="border-2 border-secondary bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileSignature className="text-secondary h-6 w-6 mr-3" />
              <div>
                <h3 className="font-medium text-neutral-800">Will Completed!</h3>
                <p className="text-sm text-neutral-600">
                  Your will has been finalized and is legally binding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
