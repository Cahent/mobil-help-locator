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
}

const createBreakdownPDF = (data: BreakdownRequest): Uint8Array => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("PANNENFALL BEAUFTRAGUNG", 20, 30);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Datum: ${new Date(data.requestDate).toLocaleDateString('de-DE')}`, 20, 50);
  doc.text(`Uhrzeit: ${new Date(data.requestDate).toLocaleTimeString('de-DE')}`, 20, 60);
  
  // Provider Info
  doc.setFontSize(14);
  doc.text("DIENSTLEISTER:", 20, 80);
  doc.setFontSize(12);
  doc.text(`Firma: ${data.provider.name}`, 20, 95);
  doc.text(`Ansprechpartner: ${data.provider.contact_person || 'N/A'}`, 20, 105);
  doc.text(`Telefon: ${data.provider.phone || 'N/A'}`, 20, 115);
  doc.text(`E-Mail: ${data.provider.email || 'N/A'}`, 20, 125);
  doc.text(`Adresse: ${data.provider.address || 'N/A'}`, 20, 135);
  
  // Request Info
  doc.setFontSize(14);
  doc.text("AUFTRAGGEBER:", 20, 160);
  doc.setFontSize(12);
  doc.text(`E-Mail: ${data.requesterEmail}`, 20, 175);
  
  // Service Details
  doc.setFontSize(14);
  doc.text("LEISTUNGSANFRAGE:", 20, 200);
  doc.setFontSize(12);
  doc.text("Hiermit beauftragen wir Sie mit der Pannenhilfe.", 20, 215);
  doc.text("Bitte kontaktieren Sie uns umgehend zur Koordination.", 20, 225);
  
  // Footer
  doc.text("Diese Beauftragung wurde automatisch generiert.", 20, 260);
  doc.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 20, 270);
  
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