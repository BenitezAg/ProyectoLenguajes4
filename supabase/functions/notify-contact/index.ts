import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const contactEmail = Deno.env.get("CONTACT_EMAIL");
  const fromEmail = Deno.env.get("CONTACT_FROM_EMAIL");

  if (!projectUrl || !serviceRoleKey || !resendApiKey || !contactEmail || !fromEmail) {
    console.error("Email notification function is missing a required server secret.");
    return jsonResponse(503, { error: "Email delivery is not configured." });
  }

  let messageId: unknown;
  try {
    const body = await request.json();
    messageId = body.messageId;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON request." });
  }

  if (
    typeof messageId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(messageId)
  ) {
    return jsonResponse(400, { error: "A valid consultation ID is required." });
  }

  const database = createClient(projectUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const claim = await database
    .from("portfolio_messages")
    .update({ notification_status: "sending" })
    .eq("id", messageId)
    .eq("notification_status", "pending")
    .select("id, name, email, subject, message")
    .maybeSingle();

  if (claim.error) {
    console.error("Could not claim the contact email delivery.");
    return jsonResponse(500, { error: "The notification could not be prepared." });
  }
  if (!claim.data) {
    return jsonResponse(200, { sent: false, duplicate: true });
  }

  const consultation = claim.data;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [contactEmail],
        reply_to: consultation.email,
        subject: `Portfolio · ${consultation.subject}`,
        html: [
          `<p><strong>De:</strong> ${escapeHtml(consultation.name)}</p>`,
          `<p><strong>Correo:</strong> ${escapeHtml(consultation.email)}</p>`,
          `<p><strong>Consulta:</strong> ${escapeHtml(consultation.subject)}</p>`,
          `<p>${escapeHtml(consultation.message).replaceAll("\n", "<br />")}</p>`,
          `<p><a href="${projectUrl}/project/default">Revisa las consultas guardadas en Supabase</a></p>`,
        ].join(""),
      }),
    });

    if (!response.ok) {
      throw new Error(`The email provider returned HTTP ${response.status}.`);
    }

    const { error } = await database
      .from("portfolio_messages")
      .update({ notification_status: "sent" })
      .eq("id", messageId)
      .eq("notification_status", "sending");

    if (error) {
      console.error("The contact email was delivered but its status could not be updated.");
      return jsonResponse(502, { error: "The email status could not be updated." });
    }

    return jsonResponse(200, { sent: true });
  } catch (error) {
    console.error("The contact email could not be delivered.", error);
    const { error: updateError } = await database
      .from("portfolio_messages")
      .update({ notification_status: "failed" })
      .eq("id", messageId)
      .eq("notification_status", "sending");

    if (updateError) {
      console.error("The failed contact email status could not be saved.");
    }
    return jsonResponse(502, { error: "The consultation was saved but its notification failed." });
  }
});
