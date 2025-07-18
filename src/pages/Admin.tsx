import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Truck, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceProvider {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_radius_km: number;
  is_active: boolean;
}

interface EmergencyVehicle {
  id: string;
  service_provider_id: string;
  license_plate: string;
  vehicle_type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  equipment: string[] | null;
  is_available: boolean;
  service_providers?: { name: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"providers" | "vehicles">("providers");
  
  // Service Provider state
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerForm, setProviderForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    service_radius_km: 50,
    is_active: true
  });

  // Emergency Vehicle state
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    service_provider_id: "",
    license_plate: "",
    vehicle_type: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    equipment: [] as string[],
    is_available: true
  });

  const equipmentOptions = [
    "Winch", "Jump Starter", "Tire Repair Kit", "Hydraulic Jack", 
    "Crane", "Flatbed", "Towing Chain", "Emergency Tools"
  ];

  const vehicleTypes = [
    { value: "tow_truck", label: "Abschleppwagen" },
    { value: "mobile_service", label: "Pannen-Service" },
    { value: "crane", label: "Kranwagen" },
    { value: "flatbed", label: "Pritschenwagen" }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (error || !data) {
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Admin-Berechtigung.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadProviders(), loadVehicles()]);
  };

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Dienstleister konnten nicht geladen werden.",
        variant: "destructive"
      });
    } else {
      setProviders(data || []);
    }
  };

  const loadVehicles = async () => {
    const { data, error } = await supabase
      .from("emergency_vehicles")
      .select(`
        *,
        service_providers (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Fahrzeuge konnten nicht geladen werden.",
        variant: "destructive"
      });
    } else {
      setVehicles(data || []);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("service_providers")
        .insert(providerForm);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Dienstleister wurde erfolgreich angelegt."
      });

      setProviderForm({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        service_radius_km: 50,
        is_active: true
      });
      setShowProviderForm(false);
      loadProviders();
    } catch (error) {
      console.error("Provider creation error:", error);
      toast({
        title: "Fehler",
        description: "Dienstleister konnte nicht angelegt werden.",
        variant: "destructive"
      });
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("emergency_vehicles")
        .insert(vehicleForm);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich angelegt."
      });

      setVehicleForm({
        service_provider_id: "",
        license_plate: "",
        vehicle_type: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        equipment: [],
        is_available: true
      });
      setShowVehicleForm(false);
      loadVehicles();
    } catch (error) {
      console.error("Vehicle creation error:", error);
      toast({
        title: "Fehler",
        description: "Fahrzeug konnte nicht angelegt werden.",
        variant: "destructive"
      });
    }
  };

  const toggleEquipment = (equipment: string) => {
    setVehicleForm(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Admin-Bereich...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin-Bereich</h1>
          <p className="text-muted-foreground">Verwalten Sie Dienstleister und Pannenfahrzeuge</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "providers" ? "default" : "outline"}
            onClick={() => setActiveTab("providers")}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Dienstleister
          </Button>
          <Button
            variant={activeTab === "vehicles" ? "default" : "outline"}
            onClick={() => setActiveTab("vehicles")}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Fahrzeuge
          </Button>
        </div>

        {/* Service Providers Tab */}
        {activeTab === "providers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Dienstleister ({providers.length})</h2>
              <Button
                onClick={() => setShowProviderForm(!showProviderForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Neuer Dienstleister
              </Button>
            </div>

            {showProviderForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Neuen Dienstleister anlegen</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProviderSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Firmenname *</Label>
                        <Input
                          id="name"
                          value={providerForm.name}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Ansprechpartner</Label>
                        <Input
                          id="contact_person"
                          value={providerForm.contact_person}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, contact_person: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={providerForm.phone}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={providerForm.email}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Textarea
                          id="address"
                          value={providerForm.address}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="radius">Service-Radius (km)</Label>
                        <Input
                          id="radius"
                          type="number"
                          min="1"
                          max="200"
                          value={providerForm.service_radius_km}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, service_radius_km: parseInt(e.target.value) || 50 }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={providerForm.is_active}
                          onCheckedChange={(checked) => setProviderForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="active">Aktiv</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Anlegen</Button>
                      <Button type="button" variant="outline" onClick={() => setShowProviderForm(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{provider.name}</h3>
                        {provider.contact_person && (
                          <p className="text-muted-foreground">Kontakt: {provider.contact_person}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          {provider.phone && <span>📞 {provider.phone}</span>}
                          {provider.email && <span>✉️ {provider.email}</span>}
                          <span>📍 Radius: {provider.service_radius_km}km</span>
                        </div>
                        {provider.address && (
                          <p className="text-sm text-muted-foreground mt-1">{provider.address}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.is_active ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="text-sm">
                          {provider.is_active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Fahrzeuge ({vehicles.length})</h2>
              <Button
                onClick={() => setShowVehicleForm(!showVehicleForm)}
                className="flex items-center gap-2"
                disabled={providers.length === 0}
              >
                <Plus className="h-4 w-4" />
                Neues Fahrzeug
              </Button>
            </div>

            {providers.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Legen Sie zuerst einen Dienstleister an, bevor Sie Fahrzeuge hinzufügen können.
                  </p>
                </CardContent>
              </Card>
            )}

            {showVehicleForm && providers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Neues Fahrzeug anlegen</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVehicleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="service_provider">Dienstleister *</Label>
                        <Select
                          value={vehicleForm.service_provider_id}
                          onValueChange={(value) => setVehicleForm(prev => ({ ...prev, service_provider_id: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Dienstleister auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.filter(p => p.is_active).map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license_plate">Kennzeichen *</Label>
                        <Input
                          id="license_plate"
                          value={vehicleForm.license_plate}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, license_plate: e.target.value.toUpperCase() }))}
                          placeholder="z.B. B-AB 1234"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_type">Fahrzeugtyp *</Label>
                        <Select
                          value={vehicleForm.vehicle_type}
                          onValueChange={(value) => setVehicleForm(prev => ({ ...prev, vehicle_type: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Typ auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marke</Label>
                        <Input
                          id="brand"
                          value={vehicleForm.brand}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, brand: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modell</Label>
                        <Input
                          id="model"
                          value={vehicleForm.model}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Baujahr</Label>
                        <Input
                          id="year"
                          type="number"
                          min="1980"
                          max={new Date().getFullYear() + 1}
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Ausrüstung</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {equipmentOptions.map((equipment) => (
                            <div key={equipment} className="flex items-center space-x-2">
                              <Switch
                                id={equipment}
                                checked={vehicleForm.equipment.includes(equipment)}
                                onCheckedChange={() => toggleEquipment(equipment)}
                              />
                              <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="available"
                          checked={vehicleForm.is_available}
                          onCheckedChange={(checked) => setVehicleForm(prev => ({ ...prev, is_available: checked }))}
                        />
                        <Label htmlFor="available">Verfügbar</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Anlegen</Button>
                      <Button type="button" variant="outline" onClick={() => setShowVehicleForm(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{vehicle.license_plate}</h3>
                        <p className="text-muted-foreground">
                          {vehicleTypes.find(t => t.value === vehicle.vehicle_type)?.label} 
                          {vehicle.service_providers && ` • ${vehicle.service_providers.name}`}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          {vehicle.brand && <span>{vehicle.brand}</span>}
                          {vehicle.model && <span>{vehicle.model}</span>}
                          {vehicle.year && <span>{vehicle.year}</span>}
                        </div>
                        {vehicle.equipment && vehicle.equipment.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Ausrüstung:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vehicle.equipment.map((eq) => (
                                <span key={eq} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {vehicle.is_available ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="text-sm">
                          {vehicle.is_available ? "Verfügbar" : "Nicht verfügbar"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;