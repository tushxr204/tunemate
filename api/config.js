// GET /api/config
// Gives the browser the PUBLIC settings it needs. The Supabase anon key is meant to be public:
// your data is protected by the Row Level Security rules in supabase/schema.sql.
// Secret keys (like YOUTUBE_API_KEY) are never sent to the browser.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    appName: process.env.APP_NAME || 'Tunemate',
  });
}
