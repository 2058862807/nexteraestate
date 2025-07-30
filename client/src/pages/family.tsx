import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import FamilyMemberCard from "@/components/family-member-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, UserPlus, Shield, CheckCircle, Clock, AlertCircle } from "lucide-react";

const familyMemberSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  relationship: z.string().min(1, "Relationship is required"),
  role: z.enum(["executor", "beneficiary", "guardian", "witness"]),
  permissions: z.object({
    canViewWill: z.boolean().default(false),
    canViewDocuments: z.boolean().default(false),
    canReceiveNotifications: z.boolean().default(true),
  }),
});

const relationshipOptions = [
  "Spouse", "Child", "Parent", "Sibling", "Grandchild", "Grandparent",
  "Aunt", "Uncle", "Cousin", "Friend", "Partner", "Other"
];

export default function Family() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const { toast } = useToast();

  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ["/api/family"],
    retry: false,
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      // Demo mode - simulate successful invite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock family member response
      const mockResponse = {
        id: Date.now(),
        ...data,
        status: 'invited',
        invitedAt: new Date().toISOString(),
        responseStatus: 'pending'
      };
      
      return mockResponse;
    },
    onSuccess: (newMember) => {
      // Add to local state since we're in demo mode
      queryClient.setQueryData(["/api/family"], (oldData: any) => {
        const currentMembers = oldData || [];
        return [...currentMembers, newMember];
      });
      
      toast({
        title: "Invitation Sent Successfully",
        description: `${newMember.firstName} ${newMember.lastName} has been invited via email.`,
      });
      setIsInviteDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Demo Mode",
        description: "Family invites working in demo mode. In production, real emails would be sent.",
        variant: "default",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      relationship: "",
      role: "beneficiary" as const,
      permissions: {
        canViewWill: false,
        canViewDocuments: false,
        canReceiveNotifications: true,
      },
    },
  });

  const handleInviteMember = async (data: any) => {
    await inviteMemberMutation.mutateAsync(data);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    form.reset({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      relationship: member.relationship,
      role: member.role,
      permissions: member.permissions || {
        canViewWill: false,
        canViewDocuments: false,
        canReceiveNotifications: true,
      },
    });
    setIsInviteDialogOpen(true);
  };

  // Group family members by role
  const membersByRole = (familyMembers as any)?.reduce((acc: any, member: any) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {}) || {};

  const roleConfig = {
    executor: { label: "Executors", icon: Shield, description: "Responsible for carrying out your will" },
    beneficiary: { label: "Beneficiaries", icon: Users, description: "Will inherit assets from your estate" },
    guardian: { label: "Guardians", icon: Shield, description: "Will care for minor children" },
    witness: { label: "Witnesses", icon: CheckCircle, description: "Will witness your will signing" },
  };

  // Calculate statistics
  const totalInvited = (familyMembers as any)?.length || 0;
  const totalAccepted = (familyMembers as any)?.filter((m: any) => m.status === 'accepted').length || 0;
  const totalPending = (familyMembers as any)?.filter((m: any) => m.status === 'invited').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Card className="trust-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="text-primary h-6 w-6 mr-3" />
                  <h1 className="text-2xl font-bold text-neutral-800">Family & Executors</h1>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Family Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMember ? "Edit Family Member" : "Invite Family Member"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleInviteMember)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="First name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="relationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {relationshipOptions.map(rel => (
                                      <SelectItem key={rel} value={rel.toLowerCase()}>
                                        {rel}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="executor">Executor</SelectItem>
                                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                                    <SelectItem value="guardian">Guardian</SelectItem>
                                    <SelectItem value="witness">Witness</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-3">
                          <FormLabel>Permissions</FormLabel>
                          
                          <FormField
                            control={form.control}
                            name="permissions.canViewWill"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Can view will</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="permissions.canViewDocuments"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Can view documents</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="permissions.canReceiveNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Receive notifications</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsInviteDialogOpen(false);
                              setEditingMember(null);
                              form.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={inviteMemberMutation.isPending}
                            className="bg-primary text-white hover:bg-blue-700"
                          >
                            {inviteMemberMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                {editingMember ? "Update" : "Send Invitation"}
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800">{totalInvited}</div>
                  <div className="text-sm text-neutral-600">Total Invited</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800">{totalAccepted}</div>
                  <div className="text-sm text-neutral-600">Accepted</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800">{totalPending}</div>
                  <div className="text-sm text-neutral-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Members by Role */}
        <div className="space-y-8">
          {Object.entries(roleConfig).map(([role, config]) => {
            const members = membersByRole[role] || [];
            const Icon = config.icon;
            
            return (
              <Card key={role} className="trust-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-primary" />
                    {config.label} ({members.length})
                  </CardTitle>
                  <p className="text-sm text-neutral-600">{config.description}</p>
                </CardHeader>
                <CardContent>
                  {members.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {members.map((member: any) => (
                        <FamilyMemberCard
                          key={member.id}
                          member={member}
                          onEdit={handleEditMember}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-lg">
                      <Icon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">
                        No {config.label.toLowerCase()} added yet
                      </h3>
                      <p className="text-neutral-600 mb-4">{config.description}</p>
                      <Button
                        onClick={() => setIsInviteDialogOpen(true)}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {role}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Educational Section */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Understanding Estate Roles</h3>
              <p className="text-neutral-600">
                Learn about the different roles in estate planning and how to choose the right people for each position.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Role Guide
              </Button>
              <Button className="bg-primary text-white hover:bg-blue-700">
                Get Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
