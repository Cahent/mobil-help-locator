import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key, Plus, Trash2, Edit2, Copy } from "lucide-react";

interface LicenseKey {
  id: string;
  license_key: string;
  name: string | null;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  max_users: number | null;
  current_users: number;
  created_at: string;
}

interface NewLicenseForm {
  name: string;
  description: string;
  expires_at: string;
  max_users: string;
}

export function LicenseKeyManagement() {
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLicense, setNewLicense] = useState<NewLicenseForm>({
    name: "",
    description: "",
    expires_at: "",
    max_users: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLicenseKeys();
  }, []);

  const loadLicenseKeys = async () => {
    const { data, error } = await supabase
      .from("license_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading license keys:", error);
      toast({
        title: "Fehler",
        description: "Lizenzschlüssel konnten nicht geladen werden.",
        variant: "destructive"
      });
    } else {
      setLicenseKeys(data || []);
    }
    setLoading(false);
  };

  const generateLicenseKey = async () => {
    try {
      // Call the database function to generate a unique key
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_license_key');

      if (keyError) throw keyError;

      const licenseData = {
        license_key: keyData,
        name: newLicense.name || null,
        description: newLicense.description || null,
        expires_at: newLicense.expires_at ? new Date(newLicense.expires_at).toISOString() : null,
        max_users: newLicense.max_users ? parseInt(newLicense.max_users) : null,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { error } = await supabase
        .from("license_keys")
        .insert([licenseData]);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Lizenzschlüssel wurde erfolgreich generiert."
      });

      setIsDialogOpen(false);
      setNewLicense({ name: "", description: "", expires_at: "", max_users: "" });
      loadLicenseKeys();
    } catch (error) {
      console.error("Error generating license key:", error);
      toast({
        title: "Fehler",
        description: "Lizenzschlüssel konnte nicht generiert werden.",
        variant: "destructive"
      });
    }
  };

  const toggleLicenseStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("license_keys")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating license status:", error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: `Lizenz wurde ${!currentStatus ? 'aktiviert' : 'deaktiviert'}.`
      });
      loadLicenseKeys();
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Lizenzschlüssel löschen möchten?")) {
      return;
    }

    const { error } = await supabase
      .from("license_keys")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting license:", error);
      toast({
        title: "Fehler",
        description: "Lizenzschlüssel konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Lizenzschlüssel wurde gelöscht."
      });
      loadLicenseKeys();
    }
  };

  const copyLicenseKey = (licenseKey: string) => {
    navigator.clipboard.writeText(licenseKey);
    toast({
      title: "Kopiert",
      description: "Lizenzschlüssel wurde in die Zwischenablage kopiert."
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  if (loading) {
    return <div className="text-center py-8">Lade Lizenzschlüssel...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <CardTitle>Lizenzschlüssel-Verwaltung</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuen Schlüssel generieren
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Lizenzschlüssel generieren</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  value={newLicense.name}
                  onChange={(e) => setNewLicense({ ...newLicense, name: e.target.value })}
                  placeholder="z.B. Kunde ABC"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  value={newLicense.description}
                  onChange={(e) => setNewLicense({ ...newLicense, description: e.target.value })}
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
              <div>
                <Label htmlFor="expires_at">Ablaufdatum (optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={newLicense.expires_at}
                  onChange={(e) => setNewLicense({ ...newLicense, expires_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max_users">Maximale Benutzer (optional)</Label>
                <Input
                  id="max_users"
                  type="number"
                  value={newLicense.max_users}
                  onChange={(e) => setNewLicense({ ...newLicense, max_users: e.target.value })}
                  placeholder="Unbegrenzt wenn leer"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={generateLicenseKey}>
                  Generieren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {licenseKeys.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Noch keine Lizenzschlüssel generiert.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lizenzschlüssel</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Ablaufdatum</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenseKeys.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{license.license_key}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLicenseKey(license.license_key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{license.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={license.is_active ? "default" : "secondary"}>
                        {license.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Switch
                        checked={license.is_active}
                        onCheckedChange={() => toggleLicenseStatus(license.id, license.is_active)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {license.current_users}
                    {license.max_users && ` / ${license.max_users}`}
                  </TableCell>
                  <TableCell>{formatDate(license.expires_at)}</TableCell>
                  <TableCell>{formatDate(license.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLicense(license.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}