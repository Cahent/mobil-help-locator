import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Truck,
  AlertCircle
} from 'lucide-react';
import { CustomerForm } from './CustomerForm';
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
  business_type: string;
  payment_terms: string;
  credit_limit: number;
  fleet_size: number;
  preferred_service_radius: number;
  is_active: boolean;
  created_at: string;
}

interface CustomerManagementProps {
  user: User;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ user }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Fehler',
        description: 'Kunden konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Möchten Sie diesen Kunden wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== customerId));
      toast({
        title: 'Erfolg',
        description: 'Kunde wurde erfolgreich gelöscht.',
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Fehler',
        description: 'Kunde konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showForm || editingCustomer) {
    return (
      <CustomerForm
        user={user}
        customer={editingCustomer}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingCustomer(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kundenverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kunden für Pannenfälle
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neuer Kunde
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Noch keine Kunden
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Legen Sie Ihren ersten Kunden an, um Pannenfälle zu verwalten.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ersten Kunden anlegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.company_name}</CardTitle>
                      <CardDescription>{customer.contact_person}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                    {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.address_city}, {customer.address_postal_code}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Truck className="w-4 h-4 mr-2" />
                    {customer.fleet_size} Fahrzeuge
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCustomer(customer)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Wichtiger Hinweis</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Die Kundendaten werden für die automatische Pannenmeldung und Dienstleistersuche verwendet. 
                Stellen Sie sicher, dass alle Kontaktdaten aktuell sind.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;