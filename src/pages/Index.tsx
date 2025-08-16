import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Cloud, Users, MapPin, Shield, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  console.log('Index component rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/4c71f37e-b150-46f2-967a-353362c58930.png" 
                alt="PannenPro Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">PannenPro</h1>
                <p className="text-sm text-muted-foreground font-medium">PANNEN DIGITAL DISPONIEREN</p>
                <Badge variant="outline" className="mt-1 text-xs bg-accent/10 text-accent border-accent/20">
                  In Gründung
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Revolutionäres <span className="text-primary">Pannen-Informationssystem</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Intelligente Dienstleistersuche und vollständige Administration für Kunden, Pannenfahrer und Dienstleister.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Unser Pannen-Informationssystem
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Intelligente Dienstleistersuche</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatische Suche nach verfügbaren Dienstleistern in einem Bereich von 25 bis 100km um den Pannenort mit sofortiger Anzeige.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Vollständige Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Komplette Verwaltung aller Bereiche: <strong>Kunden</strong>, <strong>Pannenfahrer</strong> und <strong>Dienstleister</strong> in einer einheitlichen Plattform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <CardTitle className="text-lg">Sofortige Verfügbarkeit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Echtzeit-Anzeige verfügbarer Dienstleister mit direkter Kontaktmöglichkeit und Statusverfolgung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Flexible Deployment-Optionen
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Eigene Server</CardTitle>
                <CardDescription>
                  Installation auf Ihrer eigenen Infrastruktur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Vollständige Datenkontrolle
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Anpassbare Konfiguration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Verschiedene Lizenzmodelle
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <Cloud className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Cloud-Hosting</CardTitle>
                <CardDescription>
                  Hosting auf unseren Servern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Sofort einsatzbereit
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Automatische Updates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    24/7 Support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Timeline */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Projekt-Roadmap
          </h3>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">04/2025 - Projektbeginn</h4>
                  <p className="text-muted-foreground">Start der Entwicklung des PannenPro Systems</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">08/2025 - PannenPro V1.0 Release</h4>
                  <p className="text-muted-foreground">Veröffentlichung auf Testserver mit Grundfunktionen</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Server className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">10/2025 - Produktiv-Implementation</h4>
                  <p className="text-muted-foreground">Deployment auf Produktivserver</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">11/2025 - Erster Testpartner</h4>
                  <p className="text-muted-foreground">Start mit dem ersten Testpartner im Livesystem</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emergency/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-emergency" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">01/2026 - Vermarktungsphase</h4>
                  <p className="text-muted-foreground">Beginn der aktiven Vermarktung und Kundenakquise</p>
                </div>
              </div>
            </div>

            <Card className="mt-12 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-2">PannenPro V1.0</h4>
                  <p className="text-muted-foreground mb-4">
                    Das Grundsystem wird stetig weiter ausgebaut und kann sogar nach Kundenwunsch erweitert werden.
                  </p>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Individuell erweiterbar
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Bereit für die Zukunft der Pannenhilfe?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Entdecken Sie unser innovatives System und melden Sie sich für den Kundenbereich an.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = '/auth'}
            >
              Zum Kundenlogin
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/4c71f37e-b150-46f2-967a-353362c58930.png" 
                alt="PannenPro Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold">PannenPro</span>
            </div>
            <p>&copy; 2025 PannenPro in Gründung. Pannen Digital Disponieren.</p>
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