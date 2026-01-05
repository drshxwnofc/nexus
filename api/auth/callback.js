import jwt from "jsonwebtoken";
import sql from "../db/pg.js";
import kv from "../db/kv.js";

export default async function handler(req, res) {
  // TEMP GitHub user (real GitHub API comes next step)
  const githubId = "gh_" + Date.now();

  // Create user if not exists
  await sql`
    INSERT INTO users (id, coins)
    VALUES (${githubId}, 100)
    ON CONFLICT (id) DO NOTHING
  `;

  // Cache balance in KV
  await kv.set(`coins:${githubId}`, 100);

  const token = jwt.sign(
    { id: githubId, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`
  );

  res.redirect("/dashboard.html");
}
