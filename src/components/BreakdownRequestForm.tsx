import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, MapPin, FileText, User, Mail } from "lucide-react";

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

interface BreakdownRequestFormProps {
  provider: ServiceProvider;
  isOpen: boolean;
  onClose: () => void;
}

interface BreakdownFormData {
  customerNumber: string;
  requesterEmail: string;
  vehicleData: {
    licensePlate: string;
    brand: string;
    model: string;
    vehicleType: string;
  };
  breakdownLocation: {
    address: string;
    coordinates: string;
  };
  damageDescription: string;
}

const vehicleTypes = [
  { value: "pkw", label: "PKW" },
  { value: "transporter", label: "Transporter" },
  { value: "lkw", label: "LKW" },
  { value: "motorrad", label: "Motorrad" },
  { value: "wohnmobil", label: "Wohnmobil" },
  { value: "anhänger", label: "Anhänger" },
];

export const BreakdownRequestForm = ({ provider, isOpen, onClose }: BreakdownRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BreakdownFormData>({
    customerNumber: "",
    requesterEmail: "",
    vehicleData: {
      licensePlate: "",
      brand: "",
      model: "",
      vehicleType: "",
    },
    breakdownLocation: {
      address: "",
      coordinates: "",
    },
    damageDescription: "",
  });

  const handleInputChange = (field: keyof BreakdownFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: 'vehicleData' | 'breakdownLocation', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-breakdown-request', {
        body: {
          provider: provider,
          requestDate: new Date().toISOString(),
          requesterEmail: formData.requesterEmail,
          vehicleData: formData.vehicleData,
          breakdownLocation: formData.breakdownLocation,
          damageDescription: formData.damageDescription,
          customerNumber: formData.customerNumber,
        }
      });

      if (error) throw error;

      toast({
        title: "Beauftragung erfolgreich gesendet",
        description: `Die Pannenfall-Beauftragung wurde als PDF an ${provider.email} gesendet.`,
      });

      onClose();
      
      // Reset form
      setFormData({
        customerNumber: "",
        requesterEmail: "",
        vehicleData: {
          licensePlate: "",
          brand: "",
          model: "",
          vehicleType: "",
        },
        breakdownLocation: {
          address: "",
          coordinates: "",
        },
        damageDescription: "",
      });
    } catch (error) {
      console.error('Error creating breakdown request:', error);
      toast({
        title: "Fehler",
        description: "Die Beauftragung konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pannenbeauftragung für {provider.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kunde Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Kundendaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerNumber">Kundennummer</Label>
                <Input
                  id="customerNumber"
                  value={formData.customerNumber}
                  onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                  placeholder="z.B. K123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requesterEmail">E-Mail Adresse *</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => handleInputChange('requesterEmail', e.target.value)}
                  placeholder="kunde@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fahrzeugdaten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                Fahrzeugdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Kennzeichen</Label>
                  <Input
                    id="licensePlate"
                    value={formData.vehicleData.licensePlate}
                    onChange={(e) => handleNestedChange('vehicleData', 'licensePlate', e.target.value)}
                    placeholder="z.B. HH-AB 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Fahrzeugart</Label>
                  <Select 
                    value={formData.vehicleData.vehicleType} 
                    onValueChange={(value) => handleNestedChange('vehicleData', 'vehicleType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fahrzeugart wählen" />
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
                  <Label htmlFor="brand">Hersteller</Label>
                  <Input
                    id="brand"
                    value={formData.vehicleData.brand}
                    onChange={(e) => handleNestedChange('vehicleData', 'brand', e.target.value)}
                    placeholder="z.B. BMW"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modell</Label>
                  <Input
                    id="model"
                    value={formData.vehicleData.model}
                    onChange={(e) => handleNestedChange('vehicleData', 'model', e.target.value)}
                    placeholder="z.B. 320i"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pannenstandort */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Pannenstandort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse/Ort der Panne</Label>
                <Input
                  id="address"
                  value={formData.breakdownLocation.address}
                  onChange={(e) => handleNestedChange('breakdownLocation', 'address', e.target.value)}
                  placeholder="z.B. Musterstraße 123, 12345 Musterstadt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinates">GPS-Koordinaten (optional)</Label>
                <Input
                  id="coordinates"
                  value={formData.breakdownLocation.coordinates}
                  onChange={(e) => handleNestedChange('breakdownLocation', 'coordinates', e.target.value)}
                  placeholder="z.B. 53.5511, 9.9937"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schadensbeschreibung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Schadensbeschreibung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="damageDescription">Beschreibung des Problems</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => handleInputChange('damageDescription', e.target.value)}
                  placeholder="Beschreiben Sie das Problem mit dem Fahrzeug..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.requesterEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {isSubmitting ? "Wird gesendet..." : "Beauftragung senden"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};