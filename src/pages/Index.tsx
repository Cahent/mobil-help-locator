import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Truck, Phone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            PannenPro
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pannen Digital Disponieren - Professionelle Pannenhilfe für Speditionen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/auth'}
            >
              Anmelden
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/pannendienst'}
            >
              Pannendienst finden
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Zuverlässig</CardTitle>
              <CardDescription>
                24/7 professionelle Pannenhilfe für Ihre Fahrzeugflotte
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Spezialisiert</CardTitle>
              <CardDescription>
                Expertise für Nutzfahrzeuge und Speditionsfahrzeuge aller Art
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Schnell</CardTitle>
              <CardDescription>
                Digitale Disposition für minimale Ausfallzeiten
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;