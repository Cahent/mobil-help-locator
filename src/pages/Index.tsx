import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Car, MapPin, Clock, Phone } from 'lucide-react';

const Index = () => {
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
                <p className="text-sm text-muted-foreground">Professionelle Pannenhilfe</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Schnelle <span className="text-primary">Pannenhilfe</span>
              <br />
              in Ihrer Nähe
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Verbinden Sie Kunden mit verfügbaren Pannendienstleistern im Umkreis von 100km. 
              Professionell, schnell und zuverlässig.
            </p>

            {/* Service Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">&lt; 15 Min</h3>
                <p className="text-muted-foreground">Durchschnittliche Anfahrtszeit</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">100 km</h3>
                <p className="text-muted-foreground">Service-Umkreis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">24/7</h3>
                <p className="text-muted-foreground">Verfügbarkeit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Wählen Sie Ihren Zugang
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Customer Login */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Kunde</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Finden Sie schnell verfügbare Pannendienstleister in Ihrer Nähe
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
                  variant="default" 
                  size="lg"
                  onClick={() => window.location.href = '/auth'}
                >
                  Pannenhilfe finden
                </Button>
              </CardContent>
            </Card>

            {/* Service Provider Login */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Car className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground">Pannenfahrer</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Verwalten Sie Ihre Verfügbarkeit und Einsätze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                    Status-Management
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                    Auftragsübersicht
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                    Einsatznavigation
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="warning" 
                  size="lg"
                  onClick={() => window.location.href = '/auth'}
                >
                  Fahrer-Portal
                </Button>
              </CardContent>
            </Card>

            {/* Admin Login */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-emergency/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emergency/20 transition-colors">
                  <Shield className="w-8 h-8 text-emergency" />
                </div>
                <CardTitle className="text-xl text-foreground">Administrator</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vollständige Systemverwaltung und Datenpflege
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emergency rounded-full mr-2"></div>
                    Dienstleister-Verwaltung
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emergency rounded-full mr-2"></div>
                    System-Monitoring
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emergency rounded-full mr-2"></div>
                    Reports & Analytics
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="emergency" 
                  size="lg"
                  onClick={() => window.location.href = '/auth'}
                >
                  Admin-Bereich
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 PannenService Platform. Professionelle Pannenhilfe-Vermittlung.</p>
            <div className="flex justify-center items-center mt-4 space-x-6">
              <a href="#" className="hover:text-primary transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-primary transition-colors">Impressum</a>
              <a href="#" className="hover:text-primary transition-colors">AGB</a>
              <a href="#" className="hover:text-primary transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;