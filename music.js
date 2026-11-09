// GET /api/music?artist=Drake        -> that artist's songs
// GET /api/music?q=kesariya           -> search songs
// Optional: &limit=25 (max 50) &country=IN
//
// Uses Apple's free iTunes Search API (no key needed). It returns real 30-second previews,
// album art and Apple Music links. Apple allows about 20 requests per minute, so responses
// are cached on Vercel's CDN for a day: most visitors never trigger a new Apple request.

const ALLOWED_HOST = /^https:\/\/[a-z0-9.-]+\.(mzstatic\.com|apple\.com|itunes\.apple\.com)\//i;
const clean = (u) => (typeof u === 'string' && ALLOWED_HOST.test(u) ? u : null);

export function normalize(results, artistFilter) {
  const seen = new Set();
  const out = [];
  for (const r of results || []) {
    if (r.kind !== 'song' || !r.trackId || !r.trackName) continue;
    if (artistFilter && !String(r.artistName || '').toLowerCase().includes(artistFilter.toLowerCase())) continue;
    const key = String(r.trackName).toLowerCase().replace(/\s*[([].*?[)\]]\s*/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: 'it:' + r.trackId,
      t: String(r.trackName).slice(0, 120),
      a: String(r.artistName || '').slice(0, 120),
      al: String(r.collectionName || '').slice(0, 120),
      img: clean((r.artworkUrl100 || '').replace('100x100bb', '300x300bb')),
      p: clean(r.previewUrl),
      url: clean(r.trackViewUrl),
    });
  }
  return out;
}

export default async function handler(req, res) {
  const { artist, q } = req.query || {};
  const term = String(artist || q || '').trim();
  if (!term || term.length > 80) return res.status(400).json({ error: 'Give ?artist= or ?q= (max 80 characters).' });
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const country = /^[a-z]{2}$/i.test(req.query.country || '') ? req.query.country : 'IN';

  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', term);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', String(artist ? Math.min(50, limit * 2) : limit));
  url.searchParams.set('country', country);
  if (artist) url.searchParams.set('attribute', 'artistTerm');

  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'TunemateApp/1.0' } });
    if (!r.ok) {
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(r.status === 403 || r.status === 429 ? 429 : 502).json({ error: 'Music search is busy, try again in a minute.' });
    }
    const data = await r.json();
    const songs = normalize(data.results, artist ? term : null).slice(0, limit);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ songs, source: 'Apple iTunes Search API' });
  } catch (e) {
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    return res.status(502).json({ error: 'Could not reach the music search service.' });
  }
}
