QYRELLE AUTOMATIC RELEASE KIT
=============================

This adds a daily release scanner to your EXISTING GitHub Pages website.
It does not replace your current index.html or pet.js.

WHAT IT CAN CHECK
- Spotify releases for QYRELLE (uses Spotify Web API credentials)
- Apple catalog releases for QYRELLE (public iTunes lookup endpoint)
- Recent YouTube uploads (requires YouTube Data API key + channel ID)
- A starter VRAKYN profile is included; add its artist IDs in scripts/update-releases.mjs.

IMPORTANT
- Spotify API access/permissions can change. If the workflow logs an API error, check the current Spotify developer dashboard/API terms.
- Apple results may include catalog items beyond brand-new releases; review the output during testing.
- This does not automatically detect YouTube Music catalog releases separately. The YouTube integration checks channel video uploads.
- Streaming APIs don't provide every store's link or guarantee that every release appears immediately.
- No tool can guarantee search ranking or ad revenue.
- Keep API secrets private. Never put keys in index.html or public JavaScript.

INSTALL (beginner)
1. Download and unzip this package.
2. Open your GitHub repository: https://github.com/Qyrelle/Qyrelle
3. Click Add file -> Upload files.
4. Upload the folders and files from this ZIP into the repository root. Do NOT delete or replace your existing index.html, pet.js, makima.png, or cover1.jpg.
5. Commit the uploaded files to the main branch.
6. Open repository Settings -> Secrets and variables -> Actions.
7. Under Repository secrets, add:
   SPOTIFY_CLIENT_ID
   SPOTIFY_CLIENT_SECRET
   YOUTUBE_API_KEY
8. Under Repository variables, add:
   YOUTUBE_CHANNEL_ID
   Use the actual YouTube channel ID starting with UC..., not a playlist ID or handle.
9. Open the Actions tab. Select "QYRELLE Daily Release Update", click Run workflow.
10. Check the run logs. Green check = workflow completed. A red X means open the run and read the error log.
11. Visit https://qyrelle.com/music/ after the workflow completes.

GET SPOTIFY API CREDENTIALS
- Visit https://developer.spotify.com/dashboard/
- Create an app if your account is eligible, then copy Client ID and Client Secret into GitHub Actions Secrets.
- Do not share these values publicly.

GET YOUTUBE API KEY
- Visit https://console.cloud.google.com/
- Create/select a project, enable YouTube Data API v3, create an API key, and restrict it where practical.
- Put the key in GitHub Actions Secrets.

ADD VRAKYN
- Edit scripts/update-releases.mjs.
- In the second ARTISTS entry, fill in spotifyId and appleArtistId.
- For YouTube, currently the workflow passes one channel ID via the repository variable. If both artists have separate channels, extend the configuration before relying on that scan.

DAILY SCHEDULE
The workflow runs daily at 02:17 UTC (07:47 India time), and can also be started manually from Actions.

LINK IT FROM YOUR HOMEPAGE
After verifying the new page works, add a link to your existing index.html wherever you want:
<a href="/music/">Latest Releases</a>
Do not replace the existing page with this example.

SEO
Submit https://qyrelle.com/sitemap.xml in Google Search Console after the first successful run. Google may take time to crawl pages and indexing is not guaranteed.

AD REVENUE
This kit does not install ads. Apply to an ad provider separately and add ads only after approval and compliance checks. Never click your own ads or buy fake traffic.
