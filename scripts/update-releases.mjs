
import fs from "node:fs/promises";

const SITE = "https://qyrelle.com";
const releases = [];
const artists = [
  { name: "QYRELLE", apple: "1887495171", spotify: "6kBTv9IdI3A3OshhpkheBM" },
  { name: "VRAKYN", apple: "", spotify: "" }
];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const spotifySearch = r => r.spotifyUrl || "https://open.spotify.com/search/" + encodeURIComponent(r.title.replace(/(?: - Single| – Single)$/i, "") + " " + r.artist);

for (const artist of artists) {
  if (artist.apple) {
    try {
      const url = `https://itunes.apple.com/lookup?id=${artist.apple}&entity=album&limit=100`;
      const data = await (await fetch(url)).json();

      for (const item of data.results || []) {
        if (item.wrapperType !== "collection") continue;
        releases.push({
          title: item.collectionName,
          artist: artist.name,
          date: (item.releaseDate || "").slice(0, 10),
          cover: item.artworkUrl100 || "",
          appleUrl: item.collectionViewUrl || "",
          spotifyUrl: "",
          source: "Apple Music"
        });
      }
    } catch (e) {
      console.log("Apple lookup failed:", e.message);
    }
  }
}


// Spotify Web API: scan albums/singles for configured artist profile IDs.
async function spotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.log("Spotify scan skipped: add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in GitHub Actions Secrets.");
    return null;
  }
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) throw new Error("Spotify token error " + response.status + ": " + await response.text());
  return (await response.json()).access_token;
}

async function scanSpotify() {
  let token;
  try { token = await spotifyAccessToken(); }
  catch (e) { console.log("Spotify token error: " + e.message); return; }
  if (!token) return;

  for (const artist of artists.filter(a => a.spotify)) {
    try {
      let offset = 0;
      while (offset < 100) {
        const url = "https://api.spotify.com/v1/artists/" + artist.spotify +
          "/albums?include_groups=album,single,compilation&market=IN&limit=10&offset=" + offset;
        const response = await fetch(url, { headers: { Authorization: "Bearer " + token } });
        if (!response.ok) throw new Error("Catalog error " + response.status + ": " + await response.text());
        const data = await response.json();
        for (const item of data.items || []) {
          releases.push({
            title: item.name || "Untitled",
            artist: artist.name,
            date: item.release_date || "",
            cover: item.images && item.images[0] ? item.images[0].url : "",
            spotifyUrl: item.external_urls ? item.external_urls.spotify || "" : "",
            appleUrl: "",
            source: "Spotify"
          });
        }
        if (!data.next || !data.items || !data.items.length) break;
        offset += data.items.length;
      }
      console.log("Spotify scan completed for " + artist.name + ".");
    } catch (e) {
      console.log("Spotify scan skipped for " + artist.name + ": " + e.message);
    }
  }
}

// YouTube Data API checks public uploads on a configured channel.
// This is for channel uploads, not every auto-generated YouTube Music Topic release.
async function scanYouTube() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) {
    console.log("YouTube scan skipped: configure YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in GitHub settings.");
    return;
  }
  try {
    const channelUrl = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=" +
      encodeURIComponent(channelId) + "&key=" + encodeURIComponent(apiKey);
    const cr = await fetch(channelUrl);
    if (!cr.ok) throw new Error("Channel lookup " + cr.status + ": " + await cr.text());
    const channelData = await cr.json();
    const uploads = channelData.items && channelData.items[0] &&
      channelData.items[0].contentDetails && channelData.items[0].contentDetails.relatedPlaylists &&
      channelData.items[0].contentDetails.relatedPlaylists.uploads;
    if (!uploads) throw new Error("No uploads playlist found. Check YOUTUBE_CHANNEL_ID.");

    const videoUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=" +
      encodeURIComponent(uploads) + "&maxResults=50&key=" + encodeURIComponent(apiKey);
    const vr = await fetch(videoUrl);
    if (!vr.ok) throw new Error("Uploads lookup " + vr.status + ": " + await vr.text());
    const videoData = await vr.json();
    for (const item of videoData.items || []) {
      const s = item.snippet || {};
      const id = item.contentDetails && item.contentDetails.videoId;
      if (!id) continue;
      releases.push({
        title: s.title || "YouTube upload",
        artist: s.videoOwnerChannelTitle || s.channelTitle || "QYRELLE",
        date: (s.publishedAt || "").slice(0, 10),
        cover: s.thumbnails && s.thumbnails.high ? s.thumbnails.high.url :
          (s.thumbnails && s.thumbnails.medium ? s.thumbnails.medium.url : ""),
        youtubeUrl: "https://www.youtube.com/watch?v=" + id,
        appleUrl: "",
        spotifyUrl: "",
        source: "YouTube"
      });
    }
    console.log("YouTube scan completed: " + (videoData.items || []).length + " recent uploads checked.");
  } catch (e) {
    console.log("YouTube scan skipped: " + e.message);
  }
}

await scanSpotify();
await scanYouTube();

// Collapse duplicate catalog entries when titles differ only by a release-type
// suffix or a "feat. Qyrelle" credit. Keep distinct releases from different dates.
const normalizeTitle = title => title
  .replace(/\s*[-–]\s*single\s*$/i, "")
  .replace(/\s*\(feat\.?\s*qyrelle\)\s*/i, " ")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const deduped = new Map();
for (const release of releases) {
  const key = release.artist.toLowerCase() + "|" + normalizeTitle(release.title) + "|" + release.date;
  const existing = deduped.get(key);
  if (!existing) {
    deduped.set(key, release);
    continue;
  }
  const releasePreferred = /feat\.?\s*qyrelle/i.test(release.title) && !/feat\.?\s*qyrelle/i.test(existing.title);
  const preferred = releasePreferred ? release : existing;
  deduped.set(key, {
    ...existing,
    ...preferred,
    cover: existing.cover || release.cover,
    appleUrl: existing.appleUrl || release.appleUrl,
    spotifyUrl: existing.spotifyUrl || release.spotifyUrl,
    youtubeUrl: existing.youtubeUrl || release.youtubeUrl,
    source: [...new Set((String(existing.source || "") + "," + String(release.source || "")).split(",").map(s => s.trim()).filter(Boolean))].join(", ")
  });
}
const unique = [...deduped.values()].sort((a, b) => b.date.localeCompare(a.date));

await fs.writeFile("releases.json", JSON.stringify(unique, null, 2));

await fs.mkdir("music", { recursive: true });
const cards = unique.map(r => {
  const page = `${slug(r.artist)}-${slug(r.title)}`;
  return `<article>
    ${r.cover ? `<img src="${r.cover}" alt="">` : ""}
    <h2>${r.title}</h2>
    <p>${r.artist} · ${r.date}</p>
    ${r.appleUrl ? `<a href="${r.appleUrl}" target="_blank" rel="noopener">Apple Music</a>` : ""}
    <a href="${spotifySearch(r)}" target="_blank" rel="noopener">Spotify</a>
    ${r.youtubeUrl ? `<a href="${r.youtubeUrl}" target="_blank" rel="noopener">YouTube</a>` : ""}
    <p><a href="../releases/${page}/">Song details</a></p>
  </article>`;
}).join("\n");

await fs.writeFile("music/index.html", `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Latest Music Releases | QYRELLE</title>
<meta name="description" content="Discover music releases from QYRELLE and VRAKYN.">
<style>
body{background:#08080b;color:white;font:16px Arial;padding:25px}
a{color:#ff6b9b}article{display:inline-block;vertical-align:top;
width:220px;margin:10px;padding:12px;background:#15151c;
border:1px solid #ff0055;border-radius:12px;overflow-wrap:anywhere}
img{width:100%;border-radius:8px}
</style></head><body>
<a href="/">QYRELLE Home</a><h1>Latest Releases</h1>
${cards || "<p>No releases found yet.</p>"}
</body></html>`);

await fs.mkdir("releases", { recursive: true });
for (const r of unique) {
  const name = `${slug(r.artist)}-${slug(r.title)}`;
  const dir = `releases/${name}`;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/index.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${r.title} - ${r.artist} | QYRELLE</title>
<meta name="description" content="Discover ${r.title} by ${r.artist}.">
<link rel="canonical" href="${SITE}/releases/${name}/">
</head><body style="background:#08080b;color:white;font:18px Arial;padding:30px">
<a href="/music/" style="color:#ff6b9b">All releases</a>
<h1>${r.title}</h1><p>${r.artist} · ${r.date}</p>
${r.cover ? `<img width="300" src="${r.cover}" alt="Cover art">` : ""}
<p>${r.appleUrl ? `<a href="${r.appleUrl}" target="_blank" rel="noopener">Listen on Apple Music</a>` : ""}</p>
<p><a href="${spotifySearch(r)}" target="_blank" rel="noopener">Listen / search on Spotify</a></p>
${r.youtubeUrl ? `<p><a href="${r.youtubeUrl}" target="_blank" rel="noopener">Watch on YouTube</a></p>` : ""}
</body></html>`);
}

const urls = [SITE + "/", SITE + "/music/",
  ...unique.map(r => `${SITE}/releases/${slug(r.artist)}-${slug(r.title)}/`)
];
await fs.writeFile("sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `<url><loc>${u}</loc></url>`).join("\n") +
  "\n</urlset>"
);

console.log(`Updated ${unique.length} releases.`);
