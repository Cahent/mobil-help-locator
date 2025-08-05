import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { jsPDF } from "npm:jspdf@2.5.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BreakdownRequest {
  provider: {
    name: string;
    email: string;
    phone: string;
    address: string;
    contact_person: string;
  };
  requestDate: string;
  requesterEmail: string;
  vehicleData?: {
    licensePlate?: string;
    brand?: string;
    model?: string;
    vehicleType?: string;
  };
  breakdownLocation?: {
    address?: string;
    coordinates?: string;
  };
  damageDescription?: string;
  customerNumber?: string;
}

const createBreakdownPDF = (data: BreakdownRequest): Uint8Array => {
  const doc = new jsPDF();
  const currentDate = new Date(data.requestDate);
  
  // Header mit Logo Bereich (rechts)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PNEUNET", 150, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Datum: ${currentDate.toLocaleDateString('de-DE')} ${currentDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} CEST`, 20, 15);
  doc.text("Seite 1/1", 170, 15);
  
  // Zahlungszusage Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Zahlungszusage", 80, 40);
  doc.line(20, 45, 190, 45);
  
  let yPos = 55;
  
  // Auftragsnummer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Auftragsnummer: ${Math.floor(Math.random() * 9000000) + 1000000}`, 20, yPos);
  yPos += 15;
  
  // Auftrag an (Dienstleister)
  doc.setFont("helvetica", "bold");
  doc.text("Auftrag an:", 20, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 8;
  doc.text(data.provider.name, 30, yPos);
  yPos += 6;
  if (data.provider.address) {
    const addressLines = data.provider.address.split(',');
    addressLines.forEach(line => {
      doc.text(line.trim(), 30, yPos);
      yPos += 6;
    });
  }
  yPos += 10;
  
  // Kunde Information
  doc.setFont("helvetica", "bold");
  doc.text("Kunde:", 20, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 8;
  doc.text("Pannendienst Portal", 30, yPos);
  yPos += 6;
  doc.text(data.requesterEmail, 30, yPos);
  yPos += 15;
  
  // Fahrzeugdaten Sektion
  if (data.vehicleData) {
    doc.setFont("helvetica", "bold");
    doc.text("Fahrzeugdaten:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    
    if (data.vehicleData.brand || data.vehicleData.model) {
      doc.text(`Hersteller: ${data.vehicleData.brand || 'Unbekannt'}`, 30, yPos);
      yPos += 6;
      doc.text(`Modell: ${data.vehicleData.model || 'Unbekannt'}`, 30, yPos);
      yPos += 6;
    }
    
    if (data.vehicleData.licensePlate) {
      doc.text(`Kennzeichen: ${data.vehicleData.licensePlate}`, 30, yPos);
      yPos += 6;
    }
    
    if (data.vehicleData.vehicleType) {
      doc.text(`Fahrzeugart: ${data.vehicleData.vehicleType}`, 30, yPos);
      yPos += 6;
    }
    yPos += 10;
  }
  
  // Pannenstandort
  if (data.breakdownLocation) {
    doc.setFont("helvetica", "bold");
    doc.text("Pannenstandort:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    
    if (data.breakdownLocation.address) {
      doc.text(data.breakdownLocation.address, 30, yPos);
      yPos += 6;
    }
    
    if (data.breakdownLocation.coordinates) {
      doc.text(`GPS: ${data.breakdownLocation.coordinates}`, 30, yPos);
      yPos += 6;
    }
    yPos += 10;
  }
  
  // Schadensbeschreibung
  if (data.damageDescription) {
    doc.setFont("helvetica", "bold");
    doc.text("Schaden/Beschreibung:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    
    // Text umbrechen falls zu lang
    const splitText = doc.splitTextToSize(data.damageDescription, 150);
    doc.text(splitText, 30, yPos);
    yPos += splitText.length * 6 + 10;
  }
  
  // Autorisierter Betrag
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Autorisierter Betrag:", 20, yPos);
  doc.setFontSize(14);
  doc.text("500,00 Euro exkl. MwSt", 130, yPos);
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bitte beachten: Diese Zahlungszusage (COP) ersetzt alle vorhergehenden!", 20, yPos);
  yPos += 15;
  
  // Wichtige Hinweise
  doc.text("Achtung: Es handelt sich bei diesem Fall um einen Pannendienst Fall.", 20, yPos);
  yPos += 6;
  doc.text("Bitte kontaktieren Sie umgehend den Auftraggeber zur Koordination.", 20, yPos);
  yPos += 6;
  doc.text("Bei Abrechnungsfragen kontaktieren Sie bitte die Zentrale.", 20, yPos);
  yPos += 15;
  
  // Autorisierung
  doc.text("Wir beauftragen und übernehmen die Zahlungszusage für diesen", 20, yPos);
  yPos += 6;
  doc.text("Pannenfall bis zu einem Betrag wie oben angegeben.", 20, yPos);
  
  // Footer
  yPos = 270;
  doc.setFontSize(8);
  doc.text("24/7 Pannenhilfe - Automatisch generierte Beauftragung", 20, yPos);
  doc.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 20, yPos + 6);
  
  return doc.output('arraybuffer');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, requestDate, requesterEmail }: BreakdownRequest = await req.json();

    console.log("Creating breakdown request for:", provider.name);

    // Generate PDF
    const pdfBuffer = createBreakdownPDF({ provider, requestDate, requesterEmail });
    
    // Convert to base64 for email attachment
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: "Pannendienst <onboarding@resend.dev>",
      to: [provider.email],
      subject: `Pannenfall Beauftragung - ${provider.name}`,
      html: `
        <h2>Neue Pannenfall Beauftragung</h2>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>hiermit erhalten Sie eine neue Pannenfall Beauftragung.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Datum/Uhrzeit:</strong> ${new Date(requestDate).toLocaleString('de-DE')}</li>
          <li><strong>Auftraggeber:</strong> ${requesterEmail}</li>
        </ul>
        
        <p>Die vollständigen Auftragsdaten finden Sie im anhängenden PDF-Dokument.</p>
        <p>Bitte kontaktieren Sie den Auftraggeber umgehend zur weiteren Koordination.</p>
        
        <p>Mit freundlichen Grüßen<br>Ihr Pannendienst-Portal</p>
      `,
      attachments: [
        {
          filename: `Pannenfall_Beauftragung_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBase64,
          type: 'application/pdf',
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in create-breakdown-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);