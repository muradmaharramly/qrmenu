// netlify/functions/supabase-keep-alive.js

// This Netlify Function is invoked automatically by Netlify's scheduler.
// It sends a very lightweight request to Supabase to keep the project active.

exports.handler = async (event, context) => {
  // Supabase base URL (e.g. "https://your-project-id.supabase.co")
  // Set this in Netlify: Site settings → Build & deploy → Environment.
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error("Supabase URL environment variable is not set");
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "Supabase URL environment variable is missing",
      }),
    };
  }

  // Build a request to the PostgREST API endpoint.
  // Querying the REST API root returns the OpenAPI spec and actively hits the Postgres database,
  // which is required to prevent the project from pausing (unlike auth health checks).
  // We can also query a generic endpoint just to ensure PostgREST is reached.
  const healthUrl = new URL("/rest/v1/", supabaseUrl).toString();

  const startedAt = Date.now();

  try {
    const headers = {};
    if (supabaseKey) {
      headers["apikey"] = supabaseKey;
      headers["Authorization"] = `Bearer ${supabaseKey}`;
    }

    // Perform a tiny GET request to the Supabase REST API
    const response = await fetch(healthUrl, { method: "GET", headers });
    const durationMs = Date.now() - startedAt;

    if (!response.ok && response.status !== 401 && response.status !== 404) {
      // Log failure so you can inspect it in Netlify Function logs.
      console.error("Supabase keep-alive ping failed", {
        status: response.status,
        statusText: response.statusText,
        durationMs,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          message: "Supabase keep-alive ping failed",
          status: response.status,
          durationMs,
        }),
      };
    }

    // Log success to Netlify Function logs.
    console.log("Supabase keep-alive ping succeeded", {
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
    console.error("Supabase keep-alive ping threw an error", {
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