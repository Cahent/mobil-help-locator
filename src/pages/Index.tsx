import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            PannenPro
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pannen Digital Disponieren - Professionelle Pannenhilfe für Speditionen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => window.location.href = '/auth'}
            >
              Anmelden
            </button>
            <button 
              className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.location.href = '/pannendienst'}
            >
              Pannendienst finden
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 border border-border rounded-lg bg-card">
            <div className="h-12 w-12 bg-primary rounded-lg mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Zuverlässig</h3>
            <p className="text-muted-foreground">
              24/7 professionelle Pannenhilfe für Ihre Fahrzeugflotte
            </p>
          </div>

          <div className="text-center p-6 border border-border rounded-lg bg-card">
            <div className="h-12 w-12 bg-primary rounded-lg mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Spezialisiert</h3>
            <p className="text-muted-foreground">
              Expertise für Nutzfahrzeuge und Speditionsfahrzeuge aller Art
            </p>
          </div>

          <div className="text-center p-6 border border-border rounded-lg bg-card">
            <div className="h-12 w-12 bg-primary rounded-lg mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Schnell</h3>
            <p className="text-muted-foreground">
              Digitale Disposition für minimale Ausfallzeiten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;