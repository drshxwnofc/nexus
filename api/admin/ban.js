import jwt from "jsonwebtoken";
import sql from "../db/pg.js";
import kv from "../db/kv.js";

export default async function handler(req, res) {
  try {
    const admin = jwt.verify(req.cookies.admin, process.env.JWT_SECRET);
    if (admin.role !== "admin") throw new Error();

    const { id } = req.body;

    await kv.set(`ban:${id}`, true);

    await sql`
      UPDATE users SET coins = 0 WHERE id = ${id}
    `;

    res.json({ success: true });
  } catch {
    res.status(403).end();
  }
}
