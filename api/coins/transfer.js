import jwt from "jsonwebtoken";
import kv from "../db/kv.js";
import sql from "../db/pg.js";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { to, amount } = req.body;

    if (!to || amount <= 0) {
      return res.status(400).end();
    }

    const fromKey = `coins:${user.id}`;
    const toKey = `coins:${to}`;

    const fromBalance = await kv.get(fromKey) || 0;

    if (fromBalance < amount) {
      return res.status(403).json({ error: "Insufficient coins" });
    }

    // Atomic coin move
    await kv.multi()
      .decr(fromKey, amount)
      .incr(toKey, amount)
      .exec();

    // Ledger record
    await sql`
      INSERT INTO transactions (sender, receiver, amount)
      VALUES (${user.id}, ${to}, ${amount})
    `;

    res.json({ success: true });
  } catch {
    res.status(401).end();
  }
}
