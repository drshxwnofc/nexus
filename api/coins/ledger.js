import jwt from "jsonwebtoken";
import sql from "../db/pg.js";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const rows = await sql`
      SELECT sender, receiver, amount, created_at
      FROM transactions
      WHERE sender = ${user.id} OR receiver = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json(rows);
  } catch {
    res.status(401).end();
  }
}
