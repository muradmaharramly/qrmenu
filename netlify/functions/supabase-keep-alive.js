// netlify/functions/supabase-keep-alive.js

// This Netlify Function is invoked automatically by Netlify's scheduler.
// It sends a very lightweight request to Supabase to keep the project active.

exports.handler = async (event, context) => {
  // Supabase base URL (e.g. "https://your-project-id.supabase.co")
  // Set this in Netlify: Site settings → Build & deploy → Environment.
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("SUPABASE_URL environment variable is not set");
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "SUPABASE_URL environment variable is missing",
      }),
    };
  }

  // Build a minimal health-check endpoint URL.
  // /auth/v1/health is a very small endpoint Supabase uses internally.
  // This is effectively like a "SELECT 1" check against the auth service.
  const healthUrl = new URL("/auth/v1/health", supabaseUrl).toString();

  const startedAt = Date.now();

  try {
    // Perform a tiny GET request to Supabase (no body, no heavy query).
    const response = await fetch(healthUrl, { method: "GET" });
    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      // Log failure so you can inspect it in Netlify Function logs.
      console.error("Supabase health check failed", {
        status: response.status,
        statusText: response.statusText,
        durationMs,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          message: "Supabase health check failed",
          status: response.status,
          durationMs,
        }),
      };
    }

    // Log success to Netlify Function logs.
    console.log("Supabase health check succeeded", {
      status: response.status,
      durationMs,
    });

    // Return 200 on success as requested.
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: "Supabase keep-alive ping succeeded",
        status: response.status,
        durationMs,
      }),
    };
  } catch (error) {
    // Network or runtime errors are logged and reported as failure.
    console.error("Supabase health check threw an error", {
      error: error && error.message ? error.message : String(error),
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "Supabase keep-alive ping threw an error",
      }),
    };
  }
};