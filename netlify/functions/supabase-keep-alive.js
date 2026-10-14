// netlify/functions/supabase-keep-alive.js

// Default fallback credentials in case environment variables are missing
const DEFAULT_SUPABASE_URL = "https://hviozmodqjjegyvnxhtp.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW96bW9kcWpqZWd5dm54aHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODE2OTAsImV4cCI6MjA4MTY1NzY5MH0.3JqAX6cPeUguVegv8Z6BIPaV8R2Lk2r5LrM6aICyP5Y";

async function pingSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  // Build a request to the PostgREST API endpoint.
  // Querying a real database table ensures PostgreSQL actively executes a query,
  // which resets Supabase's 7-day inactivity timer.
  const healthUrl = new URL("/rest/v1/menu_items?limit=1", supabaseUrl).toString();
  const startedAt = Date.now();

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const response = await fetch(healthUrl, { method: "GET", headers });
  const durationMs = Date.now() - startedAt;

  if (!response.ok) {
    throw new Error(
      `Supabase keep-alive ping failed with status ${response.status}: ${response.statusText}`
    );
  }

  return {
    ok: true,
    message: "Supabase keep-alive ping succeeded",
    status: response.status,
    durationMs,
  };
}

// Netlify Functions 2.0 Web Platform Standard (Request -> Response)
export default async function (req, context) {
  try {
    const result = await pingSupabase();
    console.log("Supabase keep-alive ping succeeded", result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    console.error("Supabase keep-alive error:", message);
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Supabase keep-alive ping threw an error",
        error: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Netlify Functions 1.0 (AWS Lambda-style) fallback handler
export const handler = async (event, context) => {
  try {
    const result = await pingSupabase();
    console.log("Supabase keep-alive ping succeeded", result);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    console.error("Supabase keep-alive error:", message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message: "Supabase keep-alive ping threw an error",
        error: message,
      }),
    };
  }
};

// Schedule configuration for Netlify Scheduled Functions (every 6 hours)
export const config = {
  schedule: "0 */6 * * *",
};