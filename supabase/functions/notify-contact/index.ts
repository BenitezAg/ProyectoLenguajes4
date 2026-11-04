import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RECIPIENT_LABELS: Record<string, string> = {
  "santiago-daniel-acuna": "Santiago Daniel Acuña",
  "angel-gabriel-benitez": "Angel Gabriel Benitez",
  "abel-villafane": "Abel Villafañe",
  "wilson-lopez": "Wilson Lopez",
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

async function hashAccessToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function getAuthenticatedUser(request: Request, projectUrl: string, anonKey: string) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const response = await fetch(`${projectUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: authorization,
    },
  });
  if (!response.ok) return null;
  return await response.json();
}

async function sendEmail(
  apiKey: string,
  options: { to: string; from: string; subject: string; html: string; replyTo?: string },
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`The email provider returned HTTP ${response.status}.`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const contactEmail = Deno.env.get("CONTACT_EMAIL");
  const fromEmail = Deno.env.get("CONTACT_FROM_EMAIL");

  if (!projectUrl || !serviceRoleKey || !resendApiKey || !contactEmail || !fromEmail) {
    console.error("Email notification function is missing a required server secret.");
    return jsonResponse(503, { error: "Email delivery is not configured." });
  }

  let payload: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(400, { error: "Invalid JSON request." });
    }
    payload = body as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON request." });
  }

  const action = payload.action ?? "new_message";
  const database = createClient(projectUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (action === "new_message") {
    const messageId = payload.messageId;
    const guestAccessToken = payload.guestAccessToken;
    if (
      typeof messageId !== "string" ||
      !UUID_PATTERN.test(messageId) ||
      (guestAccessToken !== null &&
        guestAccessToken !== undefined &&
        (typeof guestAccessToken !== "string" ||
          !/^[A-Za-z0-9_-]{32,128}$/.test(guestAccessToken)))
    ) {
      return jsonResponse(400, { error: "A valid consultation is required." });
    }

    const claim = await database
      .from("portfolio_messages")
      .update({ notification_status: "sending" })
      .eq("id", messageId)
      .eq("notification_status", "pending")
      .select("id, name, email, subject, message, recipient, user_id, guest_access_hash")
      .maybeSingle();

    if (claim.error) {
      console.error("Could not claim the contact email delivery.");
      return jsonResponse(500, { error: "The notification could not be prepared." });
    }
    if (!claim.data) {
      return jsonResponse(200, { sent: false, duplicate: true });
    }

    const consultation = claim.data;
    if (guestAccessToken) {
      const tokenHash = await hashAccessToken(guestAccessToken);
      if (tokenHash !== consultation.guest_access_hash) {
        await database
          .from("portfolio_messages")
          .update({ notification_status: "failed" })
          .eq("id", messageId)
          .eq("notification_status", "sending");
        return jsonResponse(400, { error: "The guest access token is invalid." });
      }
    }

    try {
      const recipient = consultation.recipient === "all"
        ? "Todo el equipo"
        : RECIPIENT_LABELS[consultation.recipient] ?? "Todo el equipo";
      await sendEmail(resendApiKey, {
        from: fromEmail,
        to: contactEmail,
        replyTo: consultation.email,
        subject: `Portfolio · ${consultation.subject}`,
        html: [
          `<p><strong>De:</strong> ${escapeHtml(consultation.name)}</p>`,
          `<p><strong>Correo:</strong> ${escapeHtml(consultation.email)}</p>`,
          `<p><strong>Para:</strong> ${escapeHtml(recipient)}</p>`,
          `<p><strong>Consulta:</strong> ${escapeHtml(consultation.subject)}</p>`,
          `<p>${escapeHtml(consultation.message).replaceAll("\n", "<br />")}</p>`,
        ].join(""),
      });

      const { error } = await database
        .from("portfolio_messages")
        .update({ notification_status: "sent" })
        .eq("id", messageId)
        .eq("notification_status", "sending");
      if (error) {
        console.error("The contact email was delivered but its status could not be updated.");
        return jsonResponse(502, { error: "The email status could not be updated." });
      }

      let confirmationSent = false;
      const siteUrl = Deno.env.get("CONTACT_SITE_URL")?.replace(/\/+$/, "");
      if (guestAccessToken && siteUrl) {
        try {
          const conversationUrl =
            `${siteUrl}/#consulta=${encodeURIComponent(guestAccessToken)}`;
          await sendEmail(resendApiKey, {
            from: fromEmail,
            to: consultation.email,
            replyTo: contactEmail,
            subject: "Recibimos tu consulta · Portfolio Lenguajes IV",
            html: `<p>Hola ${escapeHtml(consultation.name)}, recibimos tu consulta y el equipo podrá responderte.</p><p><a href="${escapeHtml(conversationUrl)}">Guarda y abre tu conversación privada</a></p><p>Cualquier persona con este enlace podrá leer y responder la conversación. No lo compartas.</p>`,
          });
          confirmationSent = true;
        } catch (error) {
          console.error("The consultation was saved but its guest confirmation email failed.", error);
        }
      }

      return jsonResponse(200, { sent: true, confirmationSent });
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
  }

  if (!["operator_reply", "customer_reply", "guest_reply"].includes(String(action))) {
    return jsonResponse(400, { error: "Unsupported notification action." });
  }

  const replyId = payload.replyId;
  if (typeof replyId !== "string" || !UUID_PATTERN.test(replyId)) {
    return jsonResponse(400, { error: "A valid reply is required." });
  }

  const replyResult = await database
    .from("portfolio_message_replies")
    .select("id, author_id, author_role, body, portfolio_messages!inner(id, name, email, subject, user_id, guest_access_hash)")
    .eq("id", replyId)
    .single();
  if (replyResult.error || !replyResult.data) {
    console.error("The conversation reply could not be loaded for email.");
    return jsonResponse(404, { error: "The conversation reply was not found." });
  }

  const reply = replyResult.data;
  const consultation = Array.isArray(reply.portfolio_messages)
    ? reply.portfolio_messages[0]
    : reply.portfolio_messages;

  if (action === "operator_reply") {
    if (!anonKey) {
      console.error("Email notification function is missing the public Supabase key.");
      return jsonResponse(503, { error: "Email delivery is not configured." });
    }
    const user = await getAuthenticatedUser(request, projectUrl, anonKey);
    if (
      !user ||
      user.app_metadata?.portfolio_role !== "operator" ||
      reply.author_role !== "operator" ||
      reply.author_id !== user.id
    ) {
      return jsonResponse(403, { error: "Only the authoring operator can send this reply." });
    }
  } else if (action === "customer_reply") {
    if (!anonKey) {
      console.error("Email notification function is missing the public Supabase key.");
      return jsonResponse(503, { error: "Email delivery is not configured." });
    }
    const user = await getAuthenticatedUser(request, projectUrl, anonKey);
    if (
      !user ||
      consultation.user_id !== user.id ||
      reply.author_role !== "customer" ||
      reply.author_id !== user.id
    ) {
      return jsonResponse(403, { error: "Only the message owner can send this reply." });
    }
  } else {
    const accessToken = payload.accessToken;
    if (
      typeof accessToken !== "string" ||
      !/^[A-Za-z0-9_-]{32,128}$/.test(accessToken) ||
      await hashAccessToken(accessToken) !== consultation.guest_access_hash ||
      reply.author_role !== "customer" ||
      reply.author_id !== null
    ) {
      return jsonResponse(403, { error: "The guest access token is invalid." });
    }
  }

  try {
    const customerReply = reply.author_role === "customer";
    await sendEmail(resendApiKey, {
      from: fromEmail,
      to: customerReply ? contactEmail : consultation.email,
      replyTo: customerReply ? consultation.email : contactEmail,
      subject: customerReply
        ? `Nueva respuesta de ${escapeHtml(consultation.name)} · ${escapeHtml(consultation.subject)}`
        : `Respuesta a tu consulta · ${escapeHtml(consultation.subject)}`,
      html: [
        `<p><strong>${customerReply ? "Mensaje de" : "Respuesta del equipo"}:</strong> ${escapeHtml(consultation.name)}</p>`,
        `<p><strong>Consulta:</strong> ${escapeHtml(consultation.subject)}</p>`,
        `<p>${escapeHtml(reply.body).replaceAll("\n", "<br />")}</p>`,
      ].join(""),
    });
    return jsonResponse(200, { sent: true });
  } catch (error) {
    console.error("The conversation reply was saved but its email notification failed.", error);
    return jsonResponse(502, { error: "The reply was saved but its email notification failed." });
  }
});
