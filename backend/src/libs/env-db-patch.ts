// Auto-append sslmode=require for Supabase URLs (required for P1001 fix)
const url = process.env.DATABASE_URL;
if (url && url.includes("supabase") && !url.includes("sslmode=")) {
  const sep = url.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${url}${sep}sslmode=require`;
}
