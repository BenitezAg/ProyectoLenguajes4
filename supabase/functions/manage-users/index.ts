import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_PATTERN = /^[0-9+(). -]{8,30}$/;

const isValidPhone = (phone: string) =>
  !phone || (
    PHONE_PATTERN.test(phone) &&
    phone.replace(/\D/g, "").length >= 8 &&
    phone.replace(/\D/g, "").length <= 15
  );

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !anonKey || !serviceRoleKey) {
    console.error("User administration function is missing a server secret.");
    return jsonResponse(503, { error: "User administration is not configured." });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Authentication is required." });
  }

  let payload: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(400, { error: "Invalid request." });
    }
    payload = body as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: "Invalid request." });
  }

  const accessToken = authorization.slice("Bearer ".length);
  const authClient = createClient(projectUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return jsonResponse(401, { error: "The session is invalid or expired." });
  }

  if (authData.user.app_metadata?.portfolio_role !== "operator") {
    return jsonResponse(403, { error: "Operator access is required." });
  }

  const database = createClient(projectUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: operatorProfile, error: profileError } = await database
    .from("portfolio_users")
    .select("active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Could not verify the operator's active status.");
    return jsonResponse(500, { error: "Could not verify operator access." });
  }
  if (!operatorProfile?.active) {
    return jsonResponse(403, { error: "Operator access is inactive." });
  }

  if (payload.action === "update_profile") {
    const userId = payload.userId;
    const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
    const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const fullName = `${firstName} ${lastName}`;
    if (
      typeof userId !== "string" ||
      !UUID_PATTERN.test(userId) ||
      firstName.length < 2 ||
      firstName.length > 70 ||
      lastName.length < 2 ||
      lastName.length > 70 ||
      fullName.length > 70 ||
      !isValidPhone(phone)
    ) {
      return jsonResponse(400, { error: "A valid user profile is required." });
    }
    const name = fullName;

    const { data: target, error: targetError } =
      await database.auth.admin.getUserById(userId);
    if (targetError || !target.user) {
      return jsonResponse(404, { error: "The account was not found." });
    }
    if (
      target.user.app_metadata?.portfolio_role === "operator" &&
      userId !== authData.user.id
    ) {
      return jsonResponse(403, { error: "Operator accounts cannot be edited here." });
    }

    const { error: authUpdateError } = await database.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...target.user.user_metadata,
          full_name: name,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    );
    if (authUpdateError) {
      console.error("Could not update the user's authentication profile.");
      return jsonResponse(500, { error: "The account name could not be updated." });
    }

    const { data: updatedProfile, error: profileUpdateError } = await database
      .from("portfolio_users")
      .update({
        name,
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (profileUpdateError || !updatedProfile) {
      console.error("Could not update the user's portfolio profile.");
      return jsonResponse(500, { error: "The account name could not be updated." });
    }

    return jsonResponse(200, { updated: true });
  }

  if (payload.action === "set_active") {
    const userId = payload.userId;
    const active = payload.active;
    if (
      typeof userId !== "string" ||
      !UUID_PATTERN.test(userId) ||
      typeof active !== "boolean"
    ) {
      return jsonResponse(400, { error: "A valid user and access status are required." });
    }
    if (userId === authData.user.id) {
      return jsonResponse(400, { error: "You cannot suspend your own account here." });
    }

    const { data: target, error: targetError } =
      await database.auth.admin.getUserById(userId);
    if (targetError || !target.user) {
      return jsonResponse(404, { error: "The account was not found." });
    }
    if (target.user.app_metadata?.portfolio_role === "operator") {
      return jsonResponse(403, { error: "Operator accounts cannot be suspended here." });
    }

    const { data: updatedProfile, error: updateError } = await database
      .from("portfolio_users")
      .update({ active })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (updateError || !updatedProfile) {
      console.error("Could not update the user's access status.");
      return jsonResponse(500, { error: "The access status could not be updated." });
    }

    return jsonResponse(200, { updated: true });
  }

  if (payload.action === "invite") {
    const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
    const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const fullName = `${firstName} ${lastName}`;
    const email = typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

    if (
      firstName.length < 2 ||
      firstName.length > 70 ||
      lastName.length < 2 ||
      lastName.length > 70 ||
      fullName.length > 70 ||
      !isValidPhone(phone) ||
      !phone ||
      email.length > 254 ||
      !EMAIL_PATTERN.test(email)
    ) {
      return jsonResponse(400, { error: "Enter a valid profile and email address." });
    }

    const siteUrl = Deno.env.get("PORTFOLIO_SITE_URL")?.trim();
    const { data: invitation, error } = await database.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
        ...(siteUrl ? { redirectTo: siteUrl } : {}),
      },
    );
    if (error || !invitation.user) {
      console.error("Could not create the user invitation.");
      return jsonResponse(400, {
        error: "The invitation could not be created. Check whether this email already has an account.",
      });
    }

    return jsonResponse(201, {
      invited: true,
      userId: invitation.user.id,
      createdAt: invitation.user.created_at,
    });
  }

  if (payload.action === "delete") {
    const userId = payload.userId;
    if (typeof userId !== "string" || !UUID_PATTERN.test(userId)) {
      return jsonResponse(400, { error: "A valid user is required." });
    }
    if (userId === authData.user.id) {
      return jsonResponse(400, { error: "You cannot delete your own account here." });
    }

    const { data: target, error: targetError } =
      await database.auth.admin.getUserById(userId);
    if (targetError || !target.user) {
      return jsonResponse(404, { error: "The account was not found." });
    }
    if (target.user.app_metadata?.portfolio_role === "operator") {
      return jsonResponse(403, { error: "Operator accounts cannot be deleted here." });
    }

    const { error } = await database.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Could not delete the user account.");
      return jsonResponse(500, { error: "The account could not be deleted." });
    }

    return jsonResponse(200, { deleted: true });
  }

  return jsonResponse(400, { error: "Unsupported user administration action." });
});
