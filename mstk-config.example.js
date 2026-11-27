// Copy this file to mstk-config.js and fill in your own Supabase project's
// public project URL and publishable/anon key. These are browser-visible values.
// NEVER put a service-role key, JWT signing secret, password, or provider API key here.
window.MSTK_CONFIG = Object.freeze({
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
  // Optional: exact HTTPS origin of the deployed MSTK API Worker.
  // Example: "https://api.example.com"
  apiBase: ""
});
