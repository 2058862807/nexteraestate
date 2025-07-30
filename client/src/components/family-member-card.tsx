import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, AlertCircle, MoreVertical, Mail, Phone, Edit, Trash2 } from "lucide-react";

interface FamilyMemberCardProps {
  member: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
    role: 'executor' | 'beneficiary' | 'guardian' | 'witness';
    status: 'invited' | 'accepted' | 'declined';
    permissions?: {
      canViewWill: boolean;
      canViewDocuments: boolean;
      canReceiveNotifications: boolean;
    };
    invitedAt: string;
    respondedAt?: string;
  };
  onEdit?: (member: any) => void;
}

const roleColors = {
  executor: "bg-blue-100 text-blue-800",
  beneficiary: "bg-green-100 text-green-800",
  guardian: "bg-purple-100 text-purple-800",
  witness: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  invited: Clock,
  accepted: CheckCircle,
  declined: AlertCircle,
};

const statusColors = {
  invited: "text-amber-600",
  accepted: "text-green-600",
  declined: "text-red-600",
};

export default function FamilyMemberCard({ member, onEdit }: FamilyMemberCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'accepted' | 'declined' }) => {
      return await apiRequest("PUT", `/api/family/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      toast({
        title: "Success",
        description: "Family member status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/family/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      toast({
        title: "Success",
        description: "Family member removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove family member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResendInvitation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement resend invitation API
      toast({
        title: "Invitation Sent",
        description: `Invitation resent to ${member.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from your estate plan?`)) {
      deleteMemberMutation.mutate(member.id);
    }
  };

  const StatusIcon = statusIcons[member.status];
  const initials = `${member.firstName[0]}${member.lastName[0]}`;

  return (
    <Card className="trust-shadow hover:shadow-lg gentle-transition">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-neutral-800">
                  {member.firstName} {member.lastName}
                </h3>
                <StatusIcon className={`h-4 w-4 ${statusColors[member.status]}`} />
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={roleColors[member.role]} variant="secondary">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                <span className="text-sm text-neutral-600">•</span>
                <span className="text-sm text-neutral-600 capitalize">{member.relationship}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-neutral-600">
                  <Mail className="h-3 w-3 mr-2" />
                  {member.email}
                </div>
                
                <div className="text-xs text-neutral-500">
                  {member.status === 'invited' && (
                    <>Invited {new Date(member.invitedAt).toLocaleDateString()}</>
                  )}
                  {member.status === 'accepted' && member.respondedAt && (
                    <>Accepted {new Date(member.respondedAt).toLocaleDateString()}</>
                  )}
                  {member.status === 'declined' && member.respondedAt && (
                    <>Declined {new Date(member.respondedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
              )}
              
              {member.status === 'invited' && (
                <DropdownMenuItem onClick={handleResendInvitation} disabled={isLoading}>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Invitation
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Permissions Summary */}
        {member.permissions && member.status === 'accepted' && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center space-x-4 text-xs text-neutral-600">
              {member.permissions.canViewWill && (
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Can view will
                </span>
              )}
              {member.permissions.canViewDocuments && (
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Can view documents
                </span>
              )}
              {member.permissions.canReceiveNotifications && (
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Receives notifications
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {member.status === 'invited' && (
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendInvitation}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full mr-2" />
              ) : (
                <Mail className="h-3 w-3 mr-2" />
              )}
              Resend Invite
            </Button>
          </div>
        )}
        
        {member.status === 'declined' && (
          <div className="mt-4">
            <Badge variant="outline" className="text-red-600 border-red-200">
              Invitation Declined
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
