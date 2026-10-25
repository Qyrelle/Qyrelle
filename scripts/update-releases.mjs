
import fs from "node:fs/promises";

const SITE = "https://qyrelle.com";
const releases = [];
const artists = [
  { name: "QYRELLE", apple: "1887495171", spotify: "6kBTv9IdI3A3OshhpkheBM" },
  { name: "VRAKYN", apple: "", spotify: "" }
];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
          spotifyUrl: `https://open.spotify.com/artist/${artist.spotify}`,
          source: "Apple Music"
        });
      }
    } catch (e) {
      console.log("Apple lookup failed:", e.message);
    }
  }
}

const unique = [...new Map(
  releases.map(r => [`${r.artist}|${r.title}|${r.date}`, r])
).values()].sort((a, b) => b.date.localeCompare(a.date));

await fs.writeFile("releases.json", JSON.stringify(unique, null, 2));

await fs.mkdir("music", { recursive: true });
const cards = unique.map(r => {
  const page = `${slug(r.artist)}-${slug(r.title)}`;
  return `<article>
    ${r.cover ? `<img src="${r.cover}" alt="">` : ""}
    <h2>${r.title}</h2>
    <p>${r.artist} · ${r.date}</p>
    <a href="${r.appleUrl}" target="_blank" rel="noopener">Apple Music</a>
    <a href="${r.spotifyUrl}" target="_blank" rel="noopener">Spotify</a>
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
<p><a href="${r.appleUrl}">Listen on Apple Music</a></p>
<p><a href="${r.spotifyUrl}">Find artist on Spotify</a></p>
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
