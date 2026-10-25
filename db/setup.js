// db/setup.js — "npm run db:setup"
// What it does, in order: wipe the two tables, rebuild them from db/schema.sql,
// insert the seed rows from db/seed.sql, then print what now exists.
// Safe to run any time — it always produces the same fresh state.

const fs = require("fs");
const path = require("path");

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL); // --env-file=.env.local injects this

function statementsFrom(file) {
  const text = fs.readFileSync(path.join(__dirname, file), "utf8");
  return text
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

// Run plain SQL text through the driver's conventional-call form.
const query = (text) => sql.query(text);

async function main() {
  console.log("Dropping old tables and rebuilding the schema...");
  for (const statement of statementsFrom("schema.sql")) {
    await query(statement);
  }

  console.log("Seeding Ludhiana Burrito and three reviews...");
  for (const statement of statementsFrom("seed.sql")) {
    await query(statement);
  }

  const restaurants = await query("SELECT * FROM restaurants ORDER BY id");
  const reviews = await query(
    "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at"
  );

  console.log("\n=== restaurants ===");
  console.table(restaurants);
  console.log("=== reviews ===");
  console.table(
    reviews.map((r) => ({
      id: r.id,
      restaurant_id: r.restaurant_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at.toISOString(),
    }))
  );

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
