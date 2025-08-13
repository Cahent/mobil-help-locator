import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Shield, Car, Users, LogOut, Building2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import CustomerManagement from './CustomerManagement';

type UserRole = Database['public']['Enums']['app_role'];

interface RoleBasedDashboardProps {
  user: User;
}

const RoleBasedDashboard = ({ user }: RoleBasedDashboardProps) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
  }, [user]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Fallback to 'user' role if no role found
        setUserRole('user');
      } else {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Shield className="w-6 h-6" />;
      case 'moderator':
        return <Car className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Pannenfahrer';
      default:
        return 'Kunde';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'emergency';
      case 'moderator':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PannenService</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {activeSection !== 'dashboard' && userRole === 'user' && (
                <Button variant="outline" size="sm" onClick={() => setActiveSection('dashboard')}>
                  Dashboard
                </Button>
              )}
              <Badge variant="outline" className={`bg-${getRoleColor()}/10 text-${getRoleColor()} border-${getRoleColor()}/20`}>
                {getRoleIcon()}
                <span className="ml-1">{getRoleLabel()}</span>
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
            Willkommen, {user.email}!
          </h2>
          <p className="text-muted-foreground">
            Sie sind angemeldet als {getRoleLabel()}
          </p>
        </div>

        {/* Role-specific content */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-emergency" />
                  Admin-Verwaltung
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Dienstleister und Fahrzeuge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/admin'}
                >
                  Admin-Bereich öffnen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-primary" />
                  Pannenfahrer-Bereich
                </CardTitle>
                <CardDescription>
                  Übersicht aller Pannenfahrer und Einsätze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/driver'}
                >
                  Pannenfahrer-Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-accent" />
                  Kunden-Bereich
                </CardTitle>
                <CardDescription>
                  Kundenverwaltung und Support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/pannendienst'}
                >
                  Kunden-Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {userRole === 'moderator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-warning" />
                  Pannenfahrer-Dashboard
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre Verfügbarkeit und Einsätze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Status-Management
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Auftragsübersicht
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Einsatznavigation
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/driver'}
                >
                  Fahrzeugstatus verwalten
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktueller Status</CardTitle>
                <CardDescription>
                  Ihre Verfügbarkeit und aktuelle Einsätze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                  Verfügbar
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}


        {userRole === 'user' && (
          <div>
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      Pannendienst suchen
                    </CardTitle>
                    <CardDescription>
                      Finden Sie schnell verfügbare Pannendienstleister
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                        Sofortige Verfügbarkeitssuche
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                        Echtzeit-Standortverfolgung
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                        Transparente Preisgestaltung
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => window.location.href = '/pannendienst'}
                    >
                      Pannendienst suchen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('customers')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-accent" />
                      Kundenverwaltung
                    </CardTitle>
                    <CardDescription>
                      Verwalten Sie Ihre Kunden für Pannenfälle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        Speditions-Kundenstamm
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        Vollständige Kontaktdaten
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        Pannen-Abwicklung
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                    >
                      Kunden verwalten
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Meine Anfragen</CardTitle>
                    <CardDescription>
                      Übersicht Ihrer bisherigen Pannenanfragen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Noch keine Anfragen vorhanden.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'customers' && (
              <CustomerManagement user={user} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedDashboard;