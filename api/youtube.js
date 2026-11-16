// GET /api/youtube?q=Kesariya Arijit Singh
// Finds the YouTube video for a song so the app can play the FULL song in an embedded player.
// Needs the YOUTUBE_API_KEY environment variable (free from Google Cloud, 10,000 units/day;
// each search costs 100 units, so about 100 new searches a day). Results are cached on the CDN
// for a week, so repeat plays of the same song cost nothing.
export default async function handler(req, res) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(501).json({ error: 'YouTube is not set up on this server.' });
  const q = String((req.query || {}).q || '').trim();
  if (!q || q.length > 120) return res.status(400).json({ error: 'Give ?q= (max 120 characters).' });

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('q', q + ' official');
  url.searchParams.set('key', key);

  try {
    const r = await fetch(url);
    if (!r.ok) {
      res.setHeader('Cache-Control', 'public, s-maxage=300');
      return res.status(r.status === 403 ? 429 : 502).json({ error: 'YouTube daily limit reached or key invalid.' });
    }
    const data = await r.json();
    const item = (data.items || [])[0];
    const id = item && item.id && item.id.videoId;
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return res.status(404).json({ error: 'No video found.' });
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
    return res.status(200).json({ id, title: String(item.snippet?.title || '').slice(0, 200) });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach YouTube.' });
  }
}
