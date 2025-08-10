# PannenPro Migration Guide - Eigener Supabase Server

## 1. Schema Export und Import

### Schema auf deinen Server importieren:
```bash
# 1. Führe die migration-to-own-server.sql auf deinem Supabase Server aus
psql -h YOUR_SERVER_HOST -U postgres -d postgres -f migration-to-own-server.sql
```

## 2. Datenexport aus aktuellem Projekt

### Daten exportieren (führe im aktuellen Supabase SQL Editor aus):
```sql
-- Export Profiles
SELECT 'INSERT INTO public.profiles VALUES (' || 
  quote_literal(id) || ',' ||
  quote_literal(created_at) || ',' ||
  quote_literal(updated_at) || ',' ||
  COALESCE(quote_literal(username), 'NULL') || ',' ||
  COALESCE(quote_literal(display_name), 'NULL') || ');'
FROM public.profiles;

-- Export User Roles
SELECT 'INSERT INTO public.user_roles VALUES (' || 
  quote_literal(id) || ',' ||
  quote_literal(user_id) || ',' ||
  quote_literal(role::text) || ',' ||
  quote_literal(created_at) || ');'
FROM public.user_roles;

-- Export License Keys
SELECT 'INSERT INTO public.license_keys VALUES (' || 
  quote_literal(id) || ',' ||
  is_active || ',' ||
  COALESCE(quote_literal(expires_at), 'NULL') || ',' ||
  COALESCE(max_users::text, 'NULL') || ',' ||
  COALESCE(current_users::text, 'NULL') || ',' ||
  quote_literal(features) || ',' ||
  COALESCE(quote_literal(created_by), 'NULL') || ',' ||
  quote_literal(created_at) || ',' ||
  quote_literal(updated_at) || ',' ||
  quote_literal(license_key) || ',' ||
  COALESCE(quote_literal(name), 'NULL') || ',' ||
  COALESCE(quote_literal(description), 'NULL') || ');'
FROM public.license_keys;

-- Export Service Providers
SELECT 'INSERT INTO public.service_providers VALUES (' || 
  quote_literal(id) || ',' ||
  COALESCE(service_radius_km::text, 'NULL') || ',' ||
  COALESCE(is_active::text, 'NULL') || ',' ||
  quote_literal(created_at) || ',' ||
  quote_literal(updated_at) || ',' ||
  COALESCE(quote_literal(address), 'NULL') || ',' ||
  quote_literal(name) || ',' ||
  COALESCE(quote_literal(contact_person), 'NULL') || ',' ||
  COALESCE(quote_literal(phone), 'NULL') || ',' ||
  COALESCE(quote_literal(email), 'NULL') || ');'
FROM public.service_providers;

-- Export Emergency Vehicles
SELECT 'INSERT INTO public.emergency_vehicles VALUES (' || 
  COALESCE(quote_literal(assigned_user_id), 'NULL') || ',' ||
  quote_literal(id) || ',' ||
  quote_literal(service_provider_id) || ',' ||
  COALESCE(year::text, 'NULL') || ',' ||
  COALESCE(current_location_lat::text, 'NULL') || ',' ||
  COALESCE(current_location_lng::text, 'NULL') || ',' ||
  COALESCE(is_available::text, 'NULL') || ',' ||
  quote_literal(created_at) || ',' ||
  quote_literal(updated_at) || ',' ||
  COALESCE(quote_literal(status::text), 'NULL') || ',' ||
  COALESCE(quote_literal(equipment), 'NULL') || ',' ||
  quote_literal(license_plate) || ',' ||
  quote_literal(vehicle_type) || ',' ||
  COALESCE(quote_literal(brand), 'NULL') || ',' ||
  COALESCE(quote_literal(model), 'NULL') || ');'
FROM public.emergency_vehicles;
```

## 3. Code-Anpassungen

### Neue Supabase-Verbindung konfigurieren:
Ändere in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://DEINE_SERVER_URL";
const SUPABASE_PUBLISHABLE_KEY = "DEIN_ANON_KEY";
```

### Neue config.toml erstellen:
Ändere in `supabase/config.toml`:

```toml
project_id = "DEINE_PROJEKT_ID"
```

## 4. Schritte der Migration

1. **Schema importieren**: Führe `migration-to-own-server.sql` auf deinem Server aus
2. **Daten exportieren**: Nutze die SQL-Queries oben im aktuellen Projekt
3. **Daten importieren**: Führe die Export-Ergebnisse auf deinem Server aus
4. **Code anpassen**: Ändere die Verbindungsdetails
5. **Auth-Trigger aktivieren**: Aktiviere den `on_auth_user_created` Trigger wenn benötigt

## 5. Vorteile der eigenen Installation

- ✅ Vollständige Kontrolle über die Daten
- ✅ Separate Test- und Produktivumgebungen
- ✅ Individuelle Backup-Strategien
- ✅ Compliance-Anforderungen erfüllbar

## 6. Test der Migration

Nach der Migration teste:
- Login/Registrierung
- Dashboard-Zugriff
- Admin-Funktionen
- Fahrzeug-Management
- Dienstleister-Suche