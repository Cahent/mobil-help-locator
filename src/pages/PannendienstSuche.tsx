import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Mail, Clock, Truck, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BreakdownRequestForm } from "@/components/BreakdownRequestForm";

interface ServiceProvider {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_radius_km: number;
  is_active: boolean;
  emergency_vehicles: EmergencyVehicle[];
}

interface EmergencyVehicle {
  id: string;
  license_plate: string;
  vehicle_type: string;
  brand: string | null;
  model: string | null;
  equipment: string[] | null;
  is_available: boolean;
}

const vehicleTypeLabels: Record<string, string> = {
  tow_truck: "Abschleppwagen",
  mobile_service: "Pannen-Service",
  crane: "Kranwagen",
  flatbed: "Pritschenwagen"
};

const PannendienstSuche = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [maxRadius, setMaxRadius] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedVehicleType, maxRadius]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          *,
          emergency_vehicles (
            id,
            license_plate,
            vehicle_type,
            brand,
            model,
            equipment,
            is_available
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      // Filter only providers with available vehicles
      const activeProviders = data?.filter(provider => 
        provider.emergency_vehicles?.some((vehicle: EmergencyVehicle) => vehicle.is_available)
      ) || [];

      setProviders(activeProviders);
    } catch (error) {
      console.error("Error loading providers:", error);
      toast({
        title: "Fehler",
        description: "Dienstleister konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(term) ||
        provider.address?.toLowerCase().includes(term) ||
        provider.contact_person?.toLowerCase().includes(term)
      );
    }

    // Filter by vehicle type
    if (selectedVehicleType !== "all") {
      filtered = filtered.filter(provider =>
        provider.emergency_vehicles?.some(vehicle => 
          vehicle.vehicle_type === selectedVehicleType && vehicle.is_available
        )
      );
    }

    // Filter by service radius
    if (maxRadius !== "all") {
      const radius = parseInt(maxRadius);
      filtered = filtered.filter(provider => provider.service_radius_km <= radius);
    }

    setFilteredProviders(filtered);
  };

  const getAvailableVehicles = (vehicles: EmergencyVehicle[]) => {
    return vehicles?.filter(vehicle => vehicle.is_available) || [];
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case "tow_truck":
        return "🚛";
      case "mobile_service":
        return "🔧";
      case "crane":
        return "🏗️";
      case "flatbed":
        return "🚚";
      default:
        return "🚗";
    }
  };

  const handleContactProvider = (provider: ServiceProvider) => {
    if (provider.phone) {
      window.location.href = `tel:${provider.phone}`;
    } else if (provider.email) {
      window.location.href = `mailto:${provider.email}`;
    } else {
      toast({
        title: "Keine Kontaktdaten",
        description: "Für diesen Dienstleister sind keine Kontaktdaten verfügbar.",
        variant: "destructive"
      });
    }
  };

  const handleCreateBreakdownRequest = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade verfügbare Pannendienste...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🚗 Pannendienst Suche
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Finden Sie schnell und zuverlässig einen Pannendienst in Ihrer Nähe. 
            Alle gelisteten Anbieter haben verfügbare Fahrzeuge und sind sofort einsatzbereit.
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Suche verfeinern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Suchbegriff</Label>
                <Input
                  id="search"
                  placeholder="Name, Ort oder Ansprechpartner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Fahrzeugtyp</Label>
                <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Fahrzeugtypen</SelectItem>
                    <SelectItem value="tow_truck">🚛 Abschleppwagen</SelectItem>
                    <SelectItem value="mobile_service">🔧 Pannen-Service</SelectItem>
                    <SelectItem value="crane">🏗️ Kranwagen</SelectItem>
                    <SelectItem value="flatbed">🚚 Pritschenwagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Max. Service-Radius</Label>
                <Select value={maxRadius} onValueChange={setMaxRadius}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Entfernungen</SelectItem>
                    <SelectItem value="25">bis 25 km</SelectItem>
                    <SelectItem value="50">bis 50 km</SelectItem>
                    <SelectItem value="100">bis 100 km</SelectItem>
                    <SelectItem value="200">bis 200 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProviders.length} verfügbare Pannendienste gefunden
          </p>
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Keine Ergebnisse gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Versuchen Sie es mit anderen Suchkriterien oder erweitern Sie den Suchbereich.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedVehicleType("all");
                  setMaxRadius("all");
                }}
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Provider Results */}
        <div className="grid gap-6">
          {filteredProviders.map((provider) => {
            const availableVehicles = getAvailableVehicles(provider.emergency_vehicles);
            return (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="h-6 w-6 text-primary" />
                        {provider.name}
                      </CardTitle>
                      {provider.contact_person && (
                        <CardDescription>
                          Ansprechpartner: {provider.contact_person}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {provider.service_radius_km} km Radius
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Information */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {provider.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {provider.phone}
                        </div>
                      )}
                      {provider.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {provider.email}
                        </div>
                      )}
                      {provider.address && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {provider.address}
                        </div>
                      )}
                    </div>

                    {/* Available Vehicles */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Verfügbare Fahrzeuge ({availableVehicles.length})
                      </h4>
                      <div className="grid gap-3">
                        {availableVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="border rounded-lg p-3 bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">
                                    {getVehicleTypeIcon(vehicle.vehicle_type)}
                                  </span>
                                  <span className="font-medium">{vehicle.license_plate}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {vehicleTypeLabels[vehicle.vehicle_type] || vehicle.vehicle_type}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {vehicle.brand && vehicle.model && (
                                    <span>{vehicle.brand} {vehicle.model}</span>
                                  )}
                                </div>
                                {vehicle.equipment && vehicle.equipment.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {vehicle.equipment.map((eq) => (
                                      <Badge key={eq} variant="secondary" className="text-xs">
                                        {eq}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Verfügbar
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        className="flex items-center gap-2"
                        onClick={() => handleContactProvider(provider)}
                      >
                        <Phone className="h-4 w-4" />
                        Jetzt anrufen
                      </Button>
                      {provider.email && (
                        <Button 
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${provider.email}`}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          E-Mail
                        </Button>
                      )}
                      <Button 
                        variant="warning"
                        onClick={() => handleCreateBreakdownRequest(provider)}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Pannenfall beauftragen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Info */}
        <Card className="mt-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚨</div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Notfall-Hinweis
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Bei akuten Notfällen mit Personenschäden wählen Sie sofort die <strong>112</strong>. 
                  Bei Pannen ohne Personenschäden können Sie die hier gelisteten Pannendienste kontaktieren.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Request Form */}
        {selectedProvider && (
          <BreakdownRequestForm
            provider={selectedProvider}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedProvider(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Missing import
import { Building2 } from "lucide-react";

export default PannendienstSuche;