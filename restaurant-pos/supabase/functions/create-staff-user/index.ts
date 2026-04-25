// FILE: supabase/functions/create-staff-user/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["waiter", "delivery"]),
  phone: z.string().trim().min(7).max(30).optional(),
  restaurantId: z.string().uuid()
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const requesterClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const {
      data: { user: requester },
      error: requesterError
    } = await requesterClient.auth.getUser();

    if (requesterError || !requester) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: requesterProfile, error: requesterProfileError } = await requesterClient
      .from("profiles")
      .select("role, restaurant_id")
      .eq("id", requester.id)
      .single();

    if (requesterProfileError || !requesterProfile) {
      return new Response(JSON.stringify({ error: "Requester profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (requesterProfile.role !== "owner") {
      return new Response(JSON.stringify({ error: "Only owners can create staff users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payload = createStaffSchema.parse(await req.json());

    if (requesterProfile.restaurant_id !== payload.restaurantId) {
      return new Response(JSON.stringify({ error: "Cannot create staff for another restaurant" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        name: payload.name,
        role: payload.role,
        restaurant_id: payload.restaurantId
      }
    });

    if (createUserError || !createdUser.user) {
      return new Response(JSON.stringify({ error: createUserError?.message ?? "Failed to create user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { error: insertProfileError } = await adminClient.from("profiles").insert({
      id: createdUser.user.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      restaurant_id: payload.restaurantId,
      phone: payload.phone ?? null,
      is_active: true
    });

    if (insertProfileError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id);

      return new Response(JSON.stringify({ error: insertProfileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        id: createdUser.user.id,
        email: createdUser.user.email,
        name: payload.name,
        role: payload.role
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    const message = error instanceof z.ZodError ? error.flatten() : (error as Error).message;
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
