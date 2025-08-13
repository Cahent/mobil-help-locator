import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  tax_number?: string;
  vat_number?: string;
  commercial_register?: string;
  business_type: string;
  payment_terms: string;
  credit_limit: number;
  fleet_size: number;
  preferred_service_radius: number;
  emergency_contact_phone?: string;
  notes?: string;
  is_active: boolean;
}

interface CustomerFormProps {
  user: User;
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  user,
  customer,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    company_name: customer?.company_name || '',
    contact_person: customer?.contact_person || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    mobile_phone: customer?.mobile_phone || '',
    address_street: customer?.address_street || '',
    address_city: customer?.address_city || '',
    address_postal_code: customer?.address_postal_code || '',
    address_country: customer?.address_country || 'Deutschland',
    tax_number: customer?.tax_number || '',
    vat_number: customer?.vat_number || '',
    commercial_register: customer?.commercial_register || '',
    business_type: customer?.business_type || 'Spedition',
    payment_terms: customer?.payment_terms || 'Net 30',
    credit_limit: customer?.credit_limit || 0,
    fleet_size: customer?.fleet_size || 0,
    preferred_service_radius: customer?.preferred_service_radius || 50,
    emergency_contact_phone: customer?.emergency_contact_phone || '',
    notes: customer?.notes || '',
    is_active: customer?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = {
        ...formData,
        user_id: user.id,
      };

      let error;
      
      if (customer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);
        error = updateError;
      } else {
        // Create new customer
        const { error: insertError } = await supabase
          .from('customers')
          .insert([customerData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: customer 
          ? 'Kunde wurde erfolgreich aktualisiert.' 
          : 'Kunde wurde erfolgreich erstellt.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Fehler',
        description: 'Kunde konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {customer ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
            </h2>
            <p className="text-muted-foreground">
              Erfassen Sie alle wichtigen Daten für Ihren Kunden
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grunddaten */}
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Firmenname *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Ansprechpartner *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Mobiltelefon</Label>
                <Input
                  id="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Notfall-Telefon</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_street">Straße und Hausnummer *</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => handleInputChange('address_street', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_postal_code">Postleitzahl *</Label>
                <Input
                  id="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Ort *</Label>
                <Input
                  id="address_city"
                  value={formData.address_city}
                  onChange={(e) => handleInputChange('address_city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_country">Land</Label>
                <Select
                  value={formData.address_country}
                  onValueChange={(value) => handleInputChange('address_country', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deutschland">Deutschland</SelectItem>
                    <SelectItem value="Österreich">Österreich</SelectItem>
                    <SelectItem value="Schweiz">Schweiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geschäftsdaten */}
        <Card>
          <CardHeader>
            <CardTitle>Geschäftsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">Geschäftsart</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => handleInputChange('business_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spedition">Spedition</SelectItem>
                    <SelectItem value="Logistikunternehmen">Logistikunternehmen</SelectItem>
                    <SelectItem value="Transportunternehmen">Transportunternehmen</SelectItem>
                    <SelectItem value="Einzelhändler">Einzelhändler</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fleet_size">Anzahl Fahrzeuge</Label>
                <Input
                  id="fleet_size"
                  type="number"
                  min="0"
                  value={formData.fleet_size}
                  onChange={(e) => handleInputChange('fleet_size', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Steuernummer</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => handleInputChange('tax_number', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">USt-IdNr.</Label>
                <Input
                  id="vat_number"
                  value={formData.vat_number}
                  onChange={(e) => handleInputChange('vat_number', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commercial_register">Handelsregister</Label>
                <Input
                  id="commercial_register"
                  value={formData.commercial_register}
                  onChange={(e) => handleInputChange('commercial_register', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_service_radius">Service-Radius (km)</Label>
                <Input
                  id="preferred_service_radius"
                  type="number"
                  min="10"
                  max="200"
                  value={formData.preferred_service_radius}
                  onChange={(e) => handleInputChange('preferred_service_radius', parseInt(e.target.value) || 50)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notizen */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zum Kunden..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {customer ? 'Aktualisieren' : 'Erstellen'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};