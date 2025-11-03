import fs from "fs";
import https from "https";

const OUTPUT_PATH = "data/simnames.json";
const BASE_NEIGHBORHOOD_URL = "https://api.xenoso.space/userapi/city/1/avatars/neighborhood/";
const ONLINE_URL = "https://api.xenoso.space/userapi/avatars/online";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error(`Invalid JSON from ${url}: ${err.message}`));
        }
      });
    }).on("error", (err) => {
      reject(new Error(`Failed to fetch ${url}: ${err.message}`));
    });
  });
}

(async () => {
  try {
    const currentNames = new Set();

    for (let i = 1; i <= 7; i++) {
      try {
        const data = await fetchJSON(`${BASE_NEIGHBORHOOD_URL}${i}`);
        const names = (data.avatars || [])
          .map(a => a.name?.trim())
          .filter(Boolean);
        names.forEach(n => currentNames.add(n));
        console.log(`Fetched ${names.length} names from neighborhood ${i}`);
      } catch (err) {
        console.warn(`⚠️ Skipped neighborhood ${i}: ${err.message}`);
      }
    }

    try {
      const onlineData = await fetchJSON(ONLINE_URL);
      const onlineNames = (onlineData.avatars || [])
        .map(a => a.name?.trim())
        .filter(Boolean);
      onlineNames.forEach(n => currentNames.add(n));
      console.log(`Fetched ${onlineNames.length} currently online players`);
    } catch (err) {
      console.warn(`⚠️ Skipped online players fetch: ${err.message}`);
    }

    let existing = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    }

    const existingSet = new Set(existing);
    const toAdd = Array.from(currentNames).filter(x => !existingSet.has(x));
    const toRemove = existing.filter(x => !currentNames.has(x));

    if (toAdd.length === 0 && toRemove.length === 0) {
      console.log("ℹ️ No changes detected — skipping update.");
      return;
    }

    const merged = Array.from(currentNames).sort();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

    console.log(`✅ Updated simnames.json:`);
    if (toAdd.length) console.log(`   ➕ Added ${toAdd.length} new names`);
    if (toRemove.length) console.log(`   ➖ Removed ${toRemove.length} old names`);
    console.log(`   💾 Total Sims: ${merged.length}`);
  } catch (err) {
    console.error("❌ Fatal error updating simnames.json:", err);
    process.exit(1);
  }
})();
