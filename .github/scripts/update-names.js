import fs from "fs";
import https from "https";

const SIM_OUTPUT = "data/simnames.json";
const LOT_OUTPUT = "data/lotnames.json";

const BASE_NEIGHBORHOOD_URL = "https://api.xenoso.space/userapi/city/1/avatars/neighborhood/";
const ONLINE_URL = "https://api.xenoso.space/userapi/avatars/online";
const LOTS_URL = "https://api.xenoso.space/userapi/city/1/city.json";

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
    if (fs.existsSync(SIM_OUTPUT)) {
      existing = JSON.parse(fs.readFileSync(SIM_OUTPUT, "utf-8"));
    }

    const existingSet = new Set(existing);
    const toAdd = Array.from(currentNames).filter(x => !existingSet.has(x));
    // const toRemove = existing.filter(x => !currentNames.has(x));

    // if (toAdd.length === 0 && toRemove.length === 0) {
    if (toAdd.length === 0) {
      console.log("ℹ️ No changes detected in simnames.json — skipping update.");
    } else {
      const merged = Array.from(new Set([...existing, ...currentNames])).sort();
      fs.writeFileSync(SIM_OUTPUT, JSON.stringify(merged, null, 2));
      console.log(`✅ Updated simnames.json:`);
      if (toAdd.length) console.log(`   ➕ Added ${toAdd.length} new Sims`);
      // if (toRemove.length) console.log(`   ➖ Removed ${toRemove.length} old Sims`);
      console.log(`   💾 Total Sims: ${merged.length}`);
    }

    try {
      const lotData = await fetchJSON(LOTS_URL);
      const lotNames = (lotData.names || [])
        .map(l => l.trim())
        .filter(Boolean);

      let existingLots = [];
      if (fs.existsSync(LOT_OUTPUT)) {
        existingLots = JSON.parse(fs.readFileSync(LOT_OUTPUT, "utf-8"));
      }

      const existingSetLots = new Set(existingLots);
      const toAddLots = lotNames.filter(x => !existingSetLots.has(x));
      const toRemoveLots = existingLots.filter(x => !lotNames.includes(x));

      if (toAddLots.length === 0 && toRemoveLots.length === 0) {
        console.log("ℹ️ No changes detected in lotnames.json — skipping update.");
      } else {
        const mergedLots = Array.from(new Set(lotNames)).sort();
        fs.writeFileSync(LOT_OUTPUT, JSON.stringify(mergedLots, null, 2));
        console.log(`✅ Updated lotnames.json:`);
        if (toAddLots.length) console.log(`   ➕ Added ${toAddLots.length} new lots`);
        if (toRemoveLots.length) console.log(`   ➖ Removed ${toRemoveLots.length} old lots`);
        console.log(`   💾 Total Lots: ${mergedLots.length}`);
      }
    } catch (err) {
      console.error("❌ Error updating lotnames.json:", err);
    }

  } catch (err) {
    console.error("❌ Fatal error in update-names.js:", err);
    process.exit(1);
  }
})();
