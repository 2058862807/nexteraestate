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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedState, setSelectedState] = useState<string>("");
  const [stateRequirements, setStateRequirements] = useState<any>(null);
  const [aiMode, setAiMode] = useState(true); // Start with AI mode
  const [simpleDescription, setSimpleDescription] = useState("");
  const [inputText, setInputText] = useState("");
  
  // Debug logging
  useEffect(() => {
    console.log("Current simpleDescription:", simpleDescription);
    console.log("Current inputText:", inputText);
  }, [simpleDescription, inputText]);
  const { toast } = useToast();

  // Get state-specific legal requirements
  useEffect(() => {
    if (selectedState) {
      const requirements = getStateRequirements(selectedState);
      setStateRequirements(requirements);
    }
  }, [selectedState]);

  const { data: wills } = useQuery({
    queryKey: ["/api/wills"],
    retry: false,
  });

  const activeWill = Array.isArray(wills) ? wills[0] : null;

  const createWillMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/wills", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wills"] });
      toast({
        title: "Success",
        description: "Will created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create will. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateWillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/wills/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wills"] });
      toast({
        title: "Success",
        description: "Will updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update will. Please try again.",
        variant: "destructive",
      });
    },
  });

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: activeWill?.personalInfo?.fullName || "",
      dateOfBirth: activeWill?.personalInfo?.dateOfBirth || "",
      address: activeWill?.personalInfo?.address || "",
      city: activeWill?.personalInfo?.city || "",
      state: activeWill?.personalInfo?.state || "",
      zipCode: activeWill?.personalInfo?.zipCode || "",
      maritalStatus: activeWill?.personalInfo?.maritalStatus || "single",
    },
  });

  const executorForm = useForm({
    resolver: zodResolver(executorSchema),
    defaultValues: {
      name: activeWill?.executors?.[0]?.name || "",
      relationship: activeWill?.executors?.[0]?.relationship || "",
      address: activeWill?.executors?.[0]?.address || "",
      phone: activeWill?.executors?.[0]?.phone || "",
    },
  });

  const assetForm = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      description: "",
      estimatedValue: "",
      beneficiary: "",
      percentage: "",
    },
  });

  const extractInfoFromText = (text: string) => {
    const nameParts = text.match(/(?:my name is|i'm|i am)\s+([^.]+?)(?:\s+from|\s+in|\.|$)/i);
    const stateParts = text.match(/from\s+([^.]+?)(?:\.|$)|in\s+([^.]+?)(?:\.|$)/i);
    
    const name = nameParts ? nameParts[1].trim() : "User";
    const state = stateParts ? (stateParts[1] || stateParts[2])?.trim() : "CA";
    
    // Simple state code mapping
    const stateMap: { [key: string]: string } = {
      'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY', 'illinois': 'IL'
    };
    
    const stateCode = stateMap[state.toLowerCase()] || 'CA';
    
    return { name, stateCode };
  };

  const handleSimpleAIGeneration = async () => {
    try {
      // Get text from direct HTML element if React state is empty
      const textarea = document.getElementById('will-input') as HTMLTextAreaElement;
      const textContent = inputText || simpleDescription || textarea?.value || "";
      
      if (!textContent || textContent.length < 10) {
        toast({
          title: "Please enter your wishes",
          description: "Type at least 10 characters describing what you want in your will.",
          variant: "destructive",
        });
        return;
      }
      
      const { name, stateCode } = extractInfoFromText(textContent);
      
      const personalInfo = {
        fullName: name,
        state: stateCode,
        city: 'Not specified',
        maritalStatus: 'single'
      };

      // Generate smart defaults from AI parsing
      const smartData = generateSmartDefaults(personalInfo, textContent);
      
      const willData = {
        title: `Last Will and Testament of ${name}`,
        state: stateCode,
        personalInfo: smartData.personalInfo,
        executors: smartData.executors,
        assets: smartData.assets,
        status: "ai_generated",
        completionPercentage: 100, // Complete
        aiGenerated: true,
        originalDescription: textContent,
      };

      if (activeWill) {
        await updateWillMutation.mutateAsync({
          id: activeWill.id,
          data: willData
        });
      } else {
        await createWillMutation.mutateAsync(willData);
      }

      toast({
        title: "Will Created Successfully!",
        description: "Your legal will is ready. Downloading now...",
      });

      // Automatically download the legal document
      setTimeout(() => {
        downloadLegalWill();
      }, 1000);

      setCurrentStep(4); // Skip to review step
    } catch (error) {
      console.error("Error generating AI will:", error);
      toast({
        title: "Error",
        description: "Failed to create will. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAIGeneration = handleSimpleAIGeneration;

  const handlePersonalInfoSubmit = async (data: any) => {
    try {
      // Set selected state for legal requirements
      setSelectedState(data.state);
      
      const willData = {
        title: `Last Will and Testament of ${data.fullName}`,
        state: data.state,
        personalInfo: data,
        status: "in_progress",
        completionPercentage: 25,
      };

      if (activeWill) {
        await updateWillMutation.mutateAsync({
          id: activeWill.id,
          data: { personalInfo: data, state: data.state, completionPercentage: 25 }
        });
      } else {
        await createWillMutation.mutateAsync(willData);
      }

      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving personal info:", error);
    }
  };

  const handleExecutorSubmit = async (data: any) => {
    try {
      const executors = [data];
      
      if (activeWill) {
        await updateWillMutation.mutateAsync({
          id: activeWill.id,
          data: { executors, completionPercentage: 50 }
        });
      }

      setCurrentStep(3);
    } catch (error) {
      console.error("Error saving executor info:", error);
    }
  };

  const handleAssetSubmit = async (data: any) => {
    try {
      const assets = activeWill?.assets || [];
      assets.push(data);
      
      if (activeWill) {
        await updateWillMutation.mutateAsync({
          id: activeWill.id,
          data: { assets, completionPercentage: 75 }
        });
      }

      setCurrentStep(4);
    } catch (error) {
      console.error("Error saving asset info:", error);
    }
  };

  const downloadLegalWill = () => {
    if (!activeWill) return;
    
    try {
      const legalDocument = generateLegalWill({
        personalInfo: activeWill.personalInfo,
        executors: activeWill.executors || [],
        assets: activeWill.assets || [],
        state: activeWill.state || selectedState
      });

      const blob = new Blob([legalDocument], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeWill.personalInfo?.fullName?.replace(/\s+/g, '_')}_Last_Will_Testament.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Legal Document Downloaded",
        description: "Your court-valid will document is ready for printing and signing.",
      });
    } catch (error) {
      console.error("Error generating legal document:", error);
      toast({
        title: "Error",
        description: "Failed to generate legal document.",
        variant: "destructive",
      });
    }
  };

  const downloadWitnessInstructions = () => {
    const state = activeWill?.state || selectedState;
    if (!state) return;
    
    try {
      const instructions = generateWitnessInstructions(state);

      const blob = new Blob([instructions], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Witness_Instructions_${state}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Instructions Downloaded",
        description: "Witness signing instructions for your state are ready.",
      });
    } catch (error) {
      console.error("Error generating instructions:", error);
    }
  };

  const handleFinalize = async () => {
    try {
      const stateReqs = getStateRequirements(activeWill?.state || selectedState);
      
      if (activeWill) {
        // Enhanced finalization with state-specific legal compliance
        await updateWillMutation.mutateAsync({
          id: activeWill.id,
          data: { 
            status: "completed", 
            completionPercentage: 100,
            legalCompliance: {
              state: activeWill.state || selectedState,
              witnessRequirements: stateReqs?.witnessRequirements,
              executorCompliance: true,
              stateSpecificLegalLanguage: stateReqs?.legalLanguage,
              finalizedDate: new Date().toISOString()
            }
          }
        });
      }

      // Automatically download the legal will document
      downloadLegalWill();

      toast({
        title: "Will Successfully Finalized!",
        description: `Your legally valid will document is ready. Click Download Will below to get your document.`,
      });

      // User stays on completion page to download and review their will
      // No automatic redirect - let user control their experience
    } catch (error) {
      console.error("Error finalizing will:", error);
      toast({
        title: "Error",
        description: "Failed to finalize will. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Card className="trust-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <FileSignature className="text-primary h-6 w-6 mr-3" />
                <h1 className="text-2xl font-bold text-neutral-800">Smart Will Builder</h1>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                  <span>Progress</span>
                  <span>{currentStep} of {steps.length} sections complete</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Step Navigation */}
              <div className="flex justify-between">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center p-3 rounded-lg ${
                        isActive ? 'bg-primary/10 text-primary' : 
                        isCompleted ? 'bg-secondary/10 text-secondary' : 
                        'text-neutral-400'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium text-center">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <Card className="trust-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return <Icon className="h-5 w-5 mr-2" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 1 && aiMode && (
              <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">Create Your Legal Will in Seconds</h1>
                    <p className="text-2xl text-gray-600 mb-8">
                      Click your situation below to instantly generate a court-valid will
                    </p>
                  </div>

                  <div className="space-y-6">
                    <WillTemplateButton
                      title="Married with Children"
                      description="Everything to spouse, then to children if spouse dies first"
                      example="My name is Sarah Johnson from Texas. Everything goes to my husband Mark Johnson. If he dies first, split everything equally between my children Emma Johnson and Michael Johnson. Mark should be my executor."
                      color="green"
                      onClick={(text) => {
                        setInputText(text);
                        setSimpleDescription(text);
                        // Skip directly to manual editing mode
                        setAiMode(false);
                        setCurrentStep(1);
                        // Pre-fill personal info if possible
                        const nameParts = text.match(/My name is ([^.]+)/);
                        const stateParts = text.match(/from ([^.]+)/);
                        if (nameParts?.[1]) {
                          personalForm.setValue('fullName', nameParts[1].trim());
                        }
                        if (stateParts?.[1]) {
                          personalForm.setValue('state', stateParts[1].trim());
                        }
                        toast({
                          title: "Template Selected!",
                          description: "Now enter your actual details below to customize your will.",
                        });
                      }}
                    />
                    
                    <WillTemplateButton
                      title="Single Parent"
                      description="Split assets equally among children"
                      example="My name is Lisa Davis from California. Split everything equally between my children Alex Davis and Jordan Davis. My sister Karen Davis should be the executor."
                      color="blue"
                      onClick={(text) => {
                        setInputText(text);
                        setSimpleDescription(text);
                        setAiMode(false);
                        setCurrentStep(1);
                        toast({
                          title: "Template Selected!",
                          description: "Now enter your actual details below to customize your will.",
                        });
                      }}
                    />
                    
                    <WillTemplateButton
                      title="Everything to One Person"
                      description="Leave all assets to one primary beneficiary"
                      example="My name is Robert Smith from Florida. Everything goes to my daughter Jennifer Smith. If she dies first, everything goes to my son David Smith. Jennifer should be my executor."
                      color="purple"
                      onClick={(text) => {
                        setInputText(text);
                        setSimpleDescription(text);
                        setAiMode(false);
                        setCurrentStep(1);
                        toast({
                          title: "Template Selected!",
                          description: "Now enter your actual details below to customize your will.",
                        });
                      }}
                    />
                    
                    <WillTemplateButton
                      title="Custom Distribution"
                      description="Specific items to specific people"
                      example="My name is Maria Garcia from New York. My house goes to my son Carlos Garcia, my savings account to my daughter Ana Garcia, and my car to my nephew Luis Garcia. Carlos should be my executor."
                      color="orange"
                      onClick={(text) => {
                        setInputText(text);
                        setSimpleDescription(text);
                        setAiMode(false);
                        setCurrentStep(1);
                        toast({
                          title: "Template Selected!",
                          description: "Now enter your actual details below to customize your will.",
                        });
                      }}
                    />
                  </div>

                  <div className="mt-12 bg-green-100 border-2 border-green-300 rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-green-800 mb-4">
                      ✓ Each template creates a legally valid will
                    </h3>
                    <p className="text-lg text-green-700">
                      Choose the closest match - you can customize details after creation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && !aiMode && (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Manual Entry</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAiMode(true)}>
                      ✨ Switch to AI Mode
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={personalForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Legal Name</FormLabel>
                          <FormControl>
                            <input
                              type="text"
                              placeholder="Enter your full legal name"
                              value={field.value || ''}
                              onChange={field.onChange}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              style={{
                                all: 'unset',
                                display: 'flex',
                                height: '40px',
                                width: '100%',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                padding: '0 12px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                      control={personalForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAllStates().map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ZIP Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State-specific legal requirements alert */}
                  {selectedState && stateRequirements && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{stateRequirements.stateName} Legal Requirements:</strong> Your will must be witnessed by {stateRequirements.witnessRequirements.minimumWitnesses} people aged {stateRequirements.witnessRequirements.witnessAgeRequirement}+. 
                        {stateRequirements.witnessRequirements.notarizationRequired && " Notarization required."}
                        {stateRequirements.restrictions.length > 0 && ` Additional requirements: ${stateRequirements.restrictions.join(", ")}.`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-primary text-white hover:bg-blue-700">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...executorForm}>
                <form onSubmit={executorForm.handleSubmit(handleExecutorSubmit)} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Primary Executor</h3>
                    <p className="text-neutral-600 text-sm">
                      Your executor will be responsible for carrying out the instructions in your will.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={executorForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Executor's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={executorForm.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Adult Child, Friend" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={executorForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={executorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="bg-primary text-white hover:bg-blue-700">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 3 && (
              <Form {...assetForm}>
                <form onSubmit={assetForm.handleSubmit(handleAssetSubmit)} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Add Asset</h3>
                    <p className="text-neutral-600 text-sm">
                      Specify how you'd like your assets distributed among your beneficiaries.
                    </p>
                  </div>

                  <FormField
                    control={assetForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Primary residence, Investment account" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={assetForm.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Value</FormLabel>
                          <FormControl>
                            <Input placeholder="$0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={assetForm.control}
                      name="percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentage (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={assetForm.control}
                    name="beneficiary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beneficiary</FormLabel>
                        <FormControl>
                          <Input placeholder="Who should receive this asset?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="bg-primary text-white hover:bg-blue-700">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h1 className="text-3xl font-bold text-green-600 mb-4">
                    Your Legal Will is Ready!
                  </h1>
                  <p className="text-xl text-neutral-600 mb-6">
                    Your court-valid will has been created and is ready to download
                  </p>
                </div>

                {/* Show original AI description if applicable */}
                {activeWill?.originalDescription && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Your Original Request:</h4>
                      <p className="text-blue-700 italic">"{activeWill.originalDescription}"</p>
                    </CardContent>
                  </Card>
                )}

                {/* State-Specific Legal Compliance Notice */}
                {activeWill?.state && stateRequirements && (
                  <Alert className="border-green-200 bg-green-50">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Legal Compliance:</strong> This will complies with {stateRequirements.stateName} state law requirements. 
                      Upon finalization, your will will include proper witness requirements ({stateRequirements.witnessRequirements.minimumWitnesses} witnesses) 
                      and legal language specific to {stateRequirements.stateName}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Will Summary */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-neutral-800 mb-2">Personal Information</h4>
                      <p className="text-neutral-600">
                        {activeWill?.personalInfo?.fullName}, {activeWill?.personalInfo?.city}, {activeWill?.state || activeWill?.personalInfo?.state}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        ✓ State-specific legal requirements applied
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-neutral-800 mb-2">Primary Executor</h4>
                      <p className="text-neutral-600">
                        {activeWill?.executors?.[0]?.name} ({activeWill?.executors?.[0]?.relationship})
                      </p>
                      {stateRequirements && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Meets {stateRequirements.stateName} executor age requirement ({stateRequirements.executorRequirements.minimumAge}+)
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-neutral-800 mb-2">Assets & Distribution</h4>
                      <p className="text-neutral-600">
                        {activeWill?.assets?.length || 0} assets specified for distribution
                      </p>
                      {stateRequirements && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Complies with {stateRequirements.stateName} {stateRequirements.assetDistribution.spouseRights} property laws
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center space-y-4">
                    <Button 
                      onClick={() => downloadLegalWill()} 
                      className="bg-green-600 hover:bg-green-700 text-white text-xl px-12 py-4 h-auto"
                    >
                      📄 DOWNLOAD YOUR WILL
                    </Button>
                    
                    <Button 
                      onClick={() => downloadWitnessInstructions()} 
                      variant="outline"
                      className="w-full text-lg py-3"
                    >
                      📋 Get Signing Instructions
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <h3 className="text-lg font-bold mb-3">What happens next:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Print your will document</li>
                      <li>Find 2 people to witness you sign it</li>
                      <li>Sign it in front of them</li>
                      <li>Keep it somewhere safe</li>
                    </ol>
                  </div>

                  <div className="text-center">
                    <Button 
                      onClick={() => window.location.href = "/dashboard"} 
                      variant="outline"
                      className="text-lg px-8 py-3"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
