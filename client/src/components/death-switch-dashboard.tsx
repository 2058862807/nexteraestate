import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  Heart, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Phone,
  Mail
} from 'lucide-react';

export default function DeathSwitchDashboard() {
  const { toast } = useToast();
  
  const { data: deathSwitch, isLoading } = useQuery({
    queryKey: ['/api/death-switch'],
    retry: false,
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/death-switch/checkin');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/death-switch'] });
      toast({
        title: "Check-in Successful",
        description: "Your death switch has been updated. Next check-in due in 30 days.",
      });
    },
    onError: () => {
      toast({
        title: "Check-in Error",
        description: "Failed to update death switch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckin = () => {
    checkinMutation.mutate();
  };

  const handleConfigureSwitch = () => {
    // Navigate to death switch configuration
    window.location.href = '/death-switch/configure';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading death switch status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!deathSwitch) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="truncate">Death Switch Not Configured</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-orange-700 break-words">
            Set up automated notifications to protect your family if something happens to you.
          </div>
          <Button onClick={handleConfigureSwitch} className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configure Death Switch
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysSinceLastCheckin = Math.floor(
    (Date.now() - new Date(deathSwitch.lastCheckin).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysUntilNext = Math.max(0, deathSwitch.checkFrequency - daysSinceLastCheckin);
  
  const isOverdue = daysSinceLastCheckin > deathSwitch.checkFrequency;
  const isWarning = daysUntilNext <= deathSwitch.warningDays;

  return (
    <Card className={`${isOverdue ? 'border-red-200 bg-red-50' : isWarning ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'} overflow-hidden`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className={`h-5 w-5 ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`} />
          <span className="truncate">Death Switch Monitor</span>
          <Badge variant={isOverdue ? 'destructive' : isWarning ? 'secondary' : 'default'} className="ml-auto">
            {deathSwitch.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Last Check-in</div>
            <div className="font-medium break-words">
              {daysSinceLastCheckin === 0 ? 'Today' : `${daysSinceLastCheckin} days ago`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Next Due</div>
            <div className="font-medium break-words">
              {isOverdue ? 'OVERDUE' : daysUntilNext === 0 ? 'Today' : `${daysUntilNext} days`}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {isOverdue && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-800 text-sm break-words">
                Your death switch is overdue. Please check in immediately to prevent emergency notifications.
              </div>
            </div>
          </div>
        )}

        {isWarning && !isOverdue && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-800 text-sm break-words">
                Check-in required soon. Don't forget to update your status.
              </div>
            </div>
          </div>
        )}

        {!isWarning && !isOverdue && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-green-800 text-sm break-words">
                Death switch is active and up to date. Your family is protected.
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {deathSwitch.emergencyContacts && deathSwitch.emergencyContacts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Emergency Contacts</div>
            <div className="space-y-1">
              {deathSwitch.emergencyContacts.slice(0, 2).map((contact: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contact.name}</span>
                </div>
              ))}
              {deathSwitch.emergencyContacts.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{deathSwitch.emergencyContacts.length - 2} more contacts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={handleCheckin} 
            disabled={checkinMutation.isPending}
            className="w-full"
            variant={isOverdue ? "destructive" : "default"}
          >
            {checkinMutation.isPending ? "Checking in..." : "Check In Now"}
          </Button>
          
          <Button 
            onClick={handleConfigureSwitch}
            variant="outline" 
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}