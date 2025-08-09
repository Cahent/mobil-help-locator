import { useState, useEffect } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DataUpdate {
  id: string;
  title: string;
  description: string;
  version: string;
  status: 'pending' | 'installing' | 'completed' | 'failed';
  created_at: string;
  installed_at: string | null;
  data_content: any;
  backup_created: boolean;
}

const UpdateManagement = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<DataUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    version: "",
    data_file: null as File | null
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      // Simulate loading updates from a hypothetical updates table
      // In a real implementation, you would create an updates table
      setUpdates([
        {
          id: "1",
          title: "Serviceanbieter-Datenbank Update",
          description: "Neue Serviceanbieter und aktualisierte Kontaktdaten",
          version: "1.2.0",
          status: "pending",
          created_at: new Date().toISOString(),
          installed_at: null,
          data_content: {},
          backup_created: false
        },
        {
          id: "2", 
          title: "Fahrzeugtypen Erweiterung",
          description: "Neue Fahrzeugtypen und Equipment-Kategorien",
          version: "1.1.5",
          status: "completed",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          installed_at: new Date().toISOString(),
          data_content: {},
          backup_created: true
        }
      ]);
    } catch (error) {
      console.error("Error loading updates:", error);
      toast({
        title: "Fehler",
        description: "Updates konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        setUpdateForm(prev => ({ ...prev, data_file: file }));
      } else {
        toast({
          title: "Ungültiger Dateityp",
          description: "Bitte wählen Sie eine JSON-Datei aus.",
          variant: "destructive"
        });
      }
    }
  };

  const uploadUpdate = async () => {
    if (!updateForm.data_file || !updateForm.title || !updateForm.version) {
      toast({
        title: "Unvollständige Daten",
        description: "Bitte füllen Sie alle Pflichtfelder aus und wählen Sie eine Datei.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Read file content
      const fileContent = await readFileAsJson(updateForm.data_file);
      
      // Create new update entry
      const newUpdate: DataUpdate = {
        id: Date.now().toString(),
        title: updateForm.title,
        description: updateForm.description,
        version: updateForm.version,
        status: "pending",
        created_at: new Date().toISOString(),
        installed_at: null,
        data_content: fileContent,
        backup_created: false
      };

      setTimeout(() => {
        setUpdates(prev => [newUpdate, ...prev]);
        setShowUploadForm(false);
        setUpdateForm({
          title: "",
          description: "",
          version: "",
          data_file: null
        });
        setUploadProgress(0);
        
        toast({
          title: "Upload erfolgreich",
          description: "Update wurde hochgeladen und steht zur Installation bereit."
        });
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Das Update konnte nicht hochgeladen werden.",
        variant: "destructive"
      });
      setUploadProgress(0);
    }
  };

  const readFileAsJson = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error("Ungültiges JSON-Format"));
        }
      };
      reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
      reader.readAsText(file);
    });
  };

  const installUpdate = async (updateId: string) => {
    const update = updates.find(u => u.id === updateId);
    if (!update) return;

    setInstalling(updateId);
    
    try {
      // Update status to installing
      setUpdates(prev => prev.map(u => 
        u.id === updateId ? { ...u, status: "installing" as const } : u
      ));

      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate data installation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update status to completed
      setUpdates(prev => prev.map(u => 
        u.id === updateId 
          ? { 
              ...u, 
              status: "completed" as const, 
              installed_at: new Date().toISOString(),
              backup_created: true 
            } 
          : u
      ));

      toast({
        title: "Installation erfolgreich",
        description: `Update "${update.title}" wurde erfolgreich installiert.`
      });

    } catch (error) {
      console.error("Installation error:", error);
      setUpdates(prev => prev.map(u => 
        u.id === updateId ? { ...u, status: "failed" as const } : u
      ));
      
      toast({
        title: "Installation fehlgeschlagen",
        description: "Das Update konnte nicht installiert werden.",
        variant: "destructive"
      });
    } finally {
      setInstalling(null);
    }
  };

  const exportCurrentData = async () => {
    try {
      // Export current system data
      const { data: providers } = await supabase
        .from("service_providers")
        .select("*");
      
      const { data: vehicles } = await supabase
        .from("emergency_vehicles")
        .select("*");

      const exportData = {
        timestamp: new Date().toISOString(),
        version: "current",
        data: {
          service_providers: providers,
          emergency_vehicles: vehicles
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json"
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: "Systemdaten wurden erfolgreich exportiert."
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Systemdaten konnten nicht exportiert werden.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: DataUpdate['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'installing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DataUpdate['status']) => {
    const variants = {
      pending: "secondary",
      installing: "default", 
      completed: "default",
      failed: "destructive"
    } as const;

    const labels = {
      pending: "Ausstehend",
      installing: "Installiert...",
      completed: "Installiert",
      failed: "Fehlgeschlagen"
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center p-6">Lade Updates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Update-Verwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Datenaktualisierungen und System-Updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCurrentData}>
            <Download className="h-4 w-4 mr-2" />
            Daten exportieren
          </Button>
          <Button onClick={() => setShowUploadForm(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Update hochladen
          </Button>
        </div>
      </div>

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neues Update hochladen</CardTitle>
            <CardDescription>
              Laden Sie eine JSON-Datei mit Datenaktualisierungen hoch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={updateForm.title}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Update-Titel eingeben"
              />
            </div>
            
            <div>
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={updateForm.version}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={updateForm.description}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibung der Änderungen"
              />
            </div>

            <div>
              <Label htmlFor="file">Datei *</Label>
              <Input
                id="file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
              />
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <Label>Upload-Fortschritt</Label>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                Abbrechen
              </Button>
              <Button onClick={uploadUpdate}>
                Upload starten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {update.title}
                    {getStatusBadge(update.status)}
                  </CardTitle>
                  <CardDescription>
                    Version {update.version} • {new Date(update.created_at).toLocaleDateString('de-DE')}
                    {update.installed_at && (
                      <span> • Installiert am {new Date(update.installed_at).toLocaleDateString('de-DE')}</span>
                    )}
                  </CardDescription>
                </div>
                
                {update.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm"
                        disabled={installing !== null}
                      >
                        {installing === update.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Installiert...
                          </>
                        ) : (
                          'Installieren'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Update installieren</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchten Sie das Update "{update.title}" installieren? 
                          Ein Backup der aktuellen Daten wird automatisch erstellt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => installUpdate(update.id)}>
                          Installieren
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            
            {update.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{update.description}</p>
                {update.backup_created && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Backup erstellt
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {updates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Keine Updates verfügbar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpdateManagement;