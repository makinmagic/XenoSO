import fs from "fs";
import https from "https";

const API_URL = "https://api.xenoso.space/userapi/avatars/online";
const OUTPUT_PATH = "data/simnames.json";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    const onlineData = await fetchJSON(API_URL);
    const newNames = onlineData.avatars.map((a) => a.name.trim()).filter(Boolean);

    // Load existing file
    let existing = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    }

    // Merge and deduplicate
    const merged = Array.from(new Set([...existing, ...newNames])).sort();

    // Only write if there are new names
    if (merged.length !== existing.length) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));
      console.log(`✅ Added ${merged.length - existing.length} new names`);
    } else {
      console.log("ℹ️ No new names to add");
    }
  } catch (err) {
    console.error("❌ Error updating simnames.json:", err);
    process.exit(1);
  }
})();
