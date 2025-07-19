import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, LogOut, Clock, CheckCircle } from 'lucide-react';

interface VehicleStatus {
  id: string;
  license_plate: string;
  vehicle_type: string;
  brand: string | null;
  model: string | null;
  status: 'verfügbar' | 'im_einsatz' | 'ruhezeit' | 'nicht_verfügbar';
  service_providers?: { name: string };
}

const statusLabels = {
  'verfügbar': 'Verfügbar',
  'im_einsatz': 'Im Einsatz',
  'ruhezeit': 'Ruhezeit',
  'nicht_verfügbar': 'Nicht verfügbar'
};

const statusColors = {
  'verfügbar': 'bg-success/10 text-success border-success/20',
  'im_einsatz': 'bg-warning/10 text-warning border-warning/20',
  'ruhezeit': 'bg-info/10 text-info border-info/20',
  'nicht_verfügbar': 'bg-destructive/10 text-destructive border-destructive/20'
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState<VehicleStatus | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    checkDriverAccess();
  }, []);

  const checkDriverAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has moderator (driver) role
      const { data: roleData, error: roleError } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'moderator'
      });

      if (roleError || !roleData) {
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Pannenfahrer-Berechtigung.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsDriver(true);
      await loadAssignedVehicle(session.user.id);
    } catch (error) {
      console.error("Driver access check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedVehicle = async (userId: string) => {
    const { data, error } = await supabase
      .from("emergency_vehicles")
      .select(`
        id,
        license_plate,
        vehicle_type,
        brand,
        model,
        status,
        service_providers (name)
      `)
      .eq('assigned_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error loading assigned vehicle:", error);
      toast({
        title: "Fehler",
        description: "Fahrzeugdaten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } else if (data) {
      setAssignedVehicle(data as VehicleStatus);
    }
  };

  const updateVehicleStatus = async (newStatus: string) => {
    if (!assignedVehicle) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("emergency_vehicles")
        .update({ status: newStatus as 'verfügbar' | 'im_einsatz' | 'ruhezeit' | 'nicht_verfügbar' })
        .eq('id', assignedVehicle.id);

      if (error) throw error;

      setAssignedVehicle(prev => prev ? { ...prev, status: newStatus as 'verfügbar' | 'im_einsatz' | 'ruhezeit' | 'nicht_verfügbar' } : null);
      
      toast({
        title: "Status aktualisiert",
        description: `Fahrzeugstatus wurde auf "${statusLabels[newStatus as keyof typeof statusLabels]}" gesetzt.`,
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Abmelden ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Pannenfahrer-Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isDriver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pannenfahrer Portal</h1>
                <p className="text-sm text-muted-foreground">Fahrzeugstatus verwalten</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                <Car className="w-4 h-4 mr-1" />
                Pannenfahrer
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Fahrzeugstatus Management
          </h2>
          <p className="text-muted-foreground">
            Verwalten Sie die Verfügbarkeit Ihres zugewiesenen Fahrzeugs
          </p>
        </div>

        {!assignedVehicle ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Kein Fahrzeug zugewiesen</h3>
              <p className="text-muted-foreground mb-4">
                Ihnen wurde noch kein Fahrzeug zugewiesen. Wenden Sie sich an Ihren Administrator.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-primary" />
                  Mein Fahrzeug
                </CardTitle>
                <CardDescription>
                  Informationen zu Ihrem zugewiesenen Fahrzeug
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Kennzeichen:</span>
                    <span className="text-lg font-bold">{assignedVehicle.license_plate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fahrzeugtyp:</span>
                    <span>{assignedVehicle.vehicle_type}</span>
                  </div>
                  {assignedVehicle.brand && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Marke:</span>
                      <span>{assignedVehicle.brand} {assignedVehicle.model}</span>
                    </div>
                  )}
                  {assignedVehicle.service_providers && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Dienstleister:</span>
                      <span>{assignedVehicle.service_providers.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-success" />
                  Status Management
                </CardTitle>
                <CardDescription>
                  Aktueller Status und Verfügbarkeit ändern
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Aktueller Status:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-sm px-3 py-1 ${statusColors[assignedVehicle.status]}`}
                  >
                    {statusLabels[assignedVehicle.status]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Status ändern:</span>
                  <Select
                    value={assignedVehicle.status}
                    onValueChange={updateVehicleStatus}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verfügbar">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                          Verfügbar
                        </div>
                      </SelectItem>
                      <SelectItem value="im_einsatz">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                          Im Einsatz
                        </div>
                      </SelectItem>
                      <SelectItem value="ruhezeit">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-info rounded-full mr-2"></div>
                          Ruhezeit
                        </div>
                      </SelectItem>
                      <SelectItem value="nicht_verfügbar">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-destructive rounded-full mr-2"></div>
                          Nicht verfügbar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {updatingStatus && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary mr-2"></div>
                    Status wird aktualisiert...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-info" />
                  Schnellaktionen
                </CardTitle>
                <CardDescription>
                  Häufig verwendete Statusänderungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => updateVehicleStatus('verfügbar')}
                    disabled={updatingStatus || assignedVehicle.status === 'verfügbar'}
                  >
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm">Verfügbar</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => updateVehicleStatus('im_einsatz')}
                    disabled={updatingStatus || assignedVehicle.status === 'im_einsatz'}
                  >
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="text-sm">Im Einsatz</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => updateVehicleStatus('ruhezeit')}
                    disabled={updatingStatus || assignedVehicle.status === 'ruhezeit'}
                  >
                    <div className="w-3 h-3 bg-info rounded-full"></div>
                    <span className="text-sm">Ruhezeit</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => updateVehicleStatus('nicht_verfügbar')}
                    disabled={updatingStatus || assignedVehicle.status === 'nicht_verfügbar'}
                  >
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span className="text-sm">Nicht verfügbar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;